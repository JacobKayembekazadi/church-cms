// API-Agnostic AI Provider
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { churchManagementTools } from './tools';

export type AIProvider = 'anthropic' | 'openai';

// Detect which provider to use based on available API keys
export function getProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) {
    return 'anthropic';
  }
  if (process.env.OPENAI_API_KEY) {
    return 'openai';
  }
  throw new Error('No API key found. Set either ANTHROPIC_API_KEY or OPENAI_API_KEY');
}

// Convert Anthropic tool format to OpenAI function format
function convertToolsToOpenAI(): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return churchManagementTools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema as Record<string, unknown>
    }
  }));
}

export interface StreamEvent {
  type: 'text' | 'tool_start' | 'tool_complete' | 'done' | 'error';
  content?: string;
  tools?: Array<{ name: string; id: string }>;
  name?: string;
  success?: boolean;
  message?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

// Anthropic streaming implementation
async function* streamAnthropic(
  messages: Array<{ role: string; content: unknown }>,
  systemPrompt: string
): AsyncGenerator<StreamEvent> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const messageStream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    tools: churchManagementTools as Anthropic.Messages.Tool[],
    messages: messages as Anthropic.Messages.MessageParam[]
  });

  for await (const event of messageStream) {
    if (event.type === 'content_block_delta') {
      if ('delta' in event && event.delta.type === 'text_delta') {
        yield { type: 'text', content: event.delta.text };
      }
    }
  }

  const fullResponse = await messageStream.finalMessage();

  if (fullResponse.stop_reason === 'tool_use') {
    const toolUseBlocks = fullResponse.content.filter(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
    );

    if (toolUseBlocks.length > 0) {
      yield {
        type: 'tool_start',
        tools: toolUseBlocks.map(t => ({ name: t.name, id: t.id }))
      };
    }
  }
}

// OpenAI streaming implementation
async function* streamOpenAI(
  messages: Array<{ role: string; content: unknown }>,
  systemPrompt: string
): AsyncGenerator<StreamEvent> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const openAIMessages = convertMessagesToOpenAI(messages, systemPrompt);

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4096,
    messages: openAIMessages,
    tools: convertToolsToOpenAI(),
    stream: true
  });

  const currentToolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;

    if (delta?.content) {
      yield { type: 'text', content: delta.content };
    }

    if (delta?.tool_calls) {
      for (const toolCall of delta.tool_calls) {
        const index = toolCall.index;
        if (!currentToolCalls.has(index)) {
          currentToolCalls.set(index, {
            id: toolCall.id || '',
            name: toolCall.function?.name || '',
            arguments: ''
          });
        }
        const current = currentToolCalls.get(index)!;
        if (toolCall.id) current.id = toolCall.id;
        if (toolCall.function?.name) current.name = toolCall.function.name;
        if (toolCall.function?.arguments) current.arguments += toolCall.function.arguments;
      }
    }

    if (chunk.choices[0]?.finish_reason === 'tool_calls') {
      const tools = Array.from(currentToolCalls.values()).map(t => ({
        name: t.name,
        id: t.id
      }));
      if (tools.length > 0) {
        yield { type: 'tool_start', tools };
      }
    }
  }
}

// Convert messages to OpenAI format
function convertMessagesToOpenAI(
  messages: Array<{ role: string; content: unknown }>,
  systemPrompt: string
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const result: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const msg of messages) {
    if (msg.role === 'user') {
      // Handle tool results
      if (Array.isArray(msg.content) && msg.content[0]?.type === 'tool_result') {
        for (const toolResult of msg.content) {
          result.push({
            role: 'tool',
            tool_call_id: toolResult.tool_use_id,
            content: toolResult.content
          });
        }
      } else {
        result.push({ role: 'user', content: msg.content as string });
      }
    } else if (msg.role === 'assistant') {
      // Handle assistant messages with tool calls
      if (Array.isArray(msg.content)) {
        const textParts = msg.content
          .filter((block: { type: string }) => block.type === 'text')
          .map((block: { text: string }) => block.text);
        const textContent = textParts.join('') || null;

        const toolCallBlocks = msg.content.filter(
          (block: { type: string }) => block.type === 'tool_use'
        );

        if (toolCallBlocks.length > 0) {
          const toolCalls = toolCallBlocks.map((block: { id: string; name: string; input: unknown }) => ({
            id: block.id,
            type: 'function' as const,
            function: {
              name: block.name,
              arguments: JSON.stringify(block.input)
            }
          }));
          result.push({
            role: 'assistant',
            content: textContent,
            tool_calls: toolCalls
          });
        } else {
          result.push({ role: 'assistant', content: textContent || '' });
        }
      } else {
        result.push({ role: 'assistant', content: msg.content as string });
      }
    }
  }

  return result;
}

export interface AIStreamOptions {
  messages: Array<{ role: string; content: unknown }>;
  systemPrompt: string;
}

export async function* createAIStream(options: AIStreamOptions): AsyncGenerator<StreamEvent> {
  const provider = getProvider();

  if (provider === 'anthropic') {
    yield* streamAnthropic(options.messages, options.systemPrompt);
  } else {
    yield* streamOpenAI(options.messages, options.systemPrompt);
  }
}

// Get tool calls from completed stream (for agentic loop)
export async function getToolCallsFromStream(
  messages: Array<{ role: string; content: unknown }>,
  systemPrompt: string
): Promise<{ toolCalls: ToolCall[]; stopReason: string; fullResponse: unknown }> {
  const provider = getProvider();

  if (provider === 'anthropic') {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      tools: churchManagementTools as Anthropic.Messages.Tool[],
      messages: messages as Anthropic.Messages.MessageParam[]
    });

    const toolCalls = response.content
      .filter((block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use')
      .map(block => ({
        id: block.id,
        name: block.name,
        input: block.input as Record<string, unknown>
      }));

    return {
      toolCalls,
      stopReason: response.stop_reason === 'tool_use' ? 'tool_use' : 'end_turn',
      fullResponse: response
    };
  } else {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const openAIMessages = convertMessagesToOpenAI(messages, systemPrompt);

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: openAIMessages,
      tools: convertToolsToOpenAI()
    });

    const message = response.choices[0]?.message;
    const toolCalls = (message?.tool_calls || [])
      .filter((tc): tc is OpenAI.Chat.Completions.ChatCompletionMessageToolCall & { type: 'function' } =>
        tc.type === 'function'
      )
      .map(tc => ({
        id: tc.id,
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments) as Record<string, unknown>
      }));

    return {
      toolCalls,
      stopReason: response.choices[0]?.finish_reason === 'tool_calls' ? 'tool_use' : 'end_turn',
      fullResponse: response
    };
  }
}

// Format assistant response for message history (provider-agnostic)
export function formatAssistantMessage(
  fullResponse: unknown,
  provider: AIProvider
): { role: 'assistant'; content: unknown } {
  if (provider === 'anthropic') {
    return {
      role: 'assistant',
      content: (fullResponse as Anthropic.Messages.Message).content
    };
  } else {
    const response = fullResponse as OpenAI.Chat.Completions.ChatCompletion;
    const message = response.choices[0]?.message;

    const content: Array<{ type: string; text?: string; id?: string; name?: string; input?: unknown }> = [];

    if (message?.content) {
      content.push({ type: 'text', text: message.content });
    }

    if (message?.tool_calls) {
      for (const tc of message.tool_calls) {
        if (tc.type === 'function') {
          content.push({
            type: 'tool_use',
            id: tc.id,
            name: tc.function.name,
            input: JSON.parse(tc.function.arguments)
          });
        }
      }
    }

    return { role: 'assistant', content };
  }
}

// Format tool results for message history (provider-agnostic)
export function formatToolResults(
  results: Array<{ tool_use_id: string; content: string }>
): { role: 'user'; content: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> } {
  return {
    role: 'user',
    content: results.map(r => ({
      type: 'tool_result' as const,
      tool_use_id: r.tool_use_id,
      content: r.content
    }))
  };
}
