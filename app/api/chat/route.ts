// Main Chat Orchestration with Streaming Support (API-Agnostic)
import { systemPrompt } from '@/lib/tools';
import { executeTool } from '@/lib/tool-executor';
import {
  getProvider,
  getToolCallsFromStream,
  formatAssistantMessage,
  formatToolResults,
  createAIStream
} from '@/lib/ai-provider';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, customSystemPrompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Check that we have an API key configured
    let provider: 'anthropic' | 'openai';
    try {
      provider = getProvider();
    } catch {
      return Response.json(
        { error: 'No API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.' },
        { status: 500 }
      );
    }

    const encoder = new TextEncoder();
    const activeSystemPrompt = customSystemPrompt || systemPrompt;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let currentMessages = [...messages];
          let continueLoop = true;
          const MAX_ITERATIONS = 10;
          let iterations = 0;

          while (continueLoop && iterations < MAX_ITERATIONS) {
            iterations++;

            // Stream text to client
            for await (const event of createAIStream({
              messages: currentMessages,
              systemPrompt: activeSystemPrompt
            })) {
              if (event.type === 'text' && event.content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    type: 'text',
                    content: event.content
                  })}\n\n`)
                );
              }
            }

            // Get full response for tool handling
            const { toolCalls, stopReason, fullResponse } = await getToolCallsFromStream(
              currentMessages,
              activeSystemPrompt
            );

            // Check if there are tool calls to process
            if (stopReason === 'tool_use' && toolCalls.length > 0) {
              // Notify client about tool execution
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'tool_start',
                  tools: toolCalls.map(t => ({
                    name: t.name,
                    id: t.id
                  }))
                })}\n\n`)
              );

              // Execute tools in parallel
              const toolResults = await Promise.all(
                toolCalls.map(async (toolCall) => {
                  try {
                    const result = await executeTool(toolCall.name, toolCall.input);

                    // Notify client of tool completion
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({
                        type: 'tool_complete',
                        name: toolCall.name,
                        success: result.success
                      })}\n\n`)
                    );

                    return {
                      tool_use_id: toolCall.id,
                      content: JSON.stringify(
                        result.success ? result.data : { error: result.error }
                      )
                    };
                  } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error(`Tool execution failed: ${toolCall.name}`, error);
                    return {
                      tool_use_id: toolCall.id,
                      content: JSON.stringify({
                        error: `Tool execution failed: ${errorMessage}`
                      })
                    };
                  }
                })
              );

              // Add assistant response and tool results to message history
              currentMessages.push(formatAssistantMessage(fullResponse, provider));
              currentMessages.push(formatToolResults(toolResults));

              // Continue the loop to let AI respond with tool results
              continue;
            }

            // No more tool calls - we're done
            continueLoop = false;

            // Send completion signal
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            );

            controller.close();
          }

          if (iterations >= MAX_ITERATIONS) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                message: 'Maximum iterations reached'
              })}\n\n`)
            );
            controller.close();
          }

        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              message: errorMessage
            })}\n\n`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Chat endpoint error:', error);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
