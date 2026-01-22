// Main Chat Orchestration with Streaming Support
import Anthropic from '@anthropic-ai/sdk';
import { churchManagementTools, systemPrompt } from '@/lib/tools';
import { executeTool } from '@/lib/tool-executor';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

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

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let currentMessages = [...messages];
          let continueLoop = true;
          const MAX_ITERATIONS = 10;
          let iterations = 0;

          while (continueLoop && iterations < MAX_ITERATIONS) {
            iterations++;

            // Stream the response from Claude
            const messageStream = await client.messages.stream({
              model: "claude-sonnet-4-20250514",
              max_tokens: 4096,
              system: customSystemPrompt || systemPrompt,
              tools: churchManagementTools,
              messages: currentMessages
            });

            // Stream text deltas to client
            for await (const event of messageStream) {
              if (event.type === 'content_block_delta') {
                if (event.delta.type === 'text_delta') {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({
                      type: 'text',
                      content: event.delta.text
                    })}\n\n`)
                  );
                }
              }
            }

            // Get final message
            const fullResponse = await messageStream.finalMessage();

            // Check if Claude wants to use tools
            if (fullResponse.stop_reason === 'tool_use') {
              const toolUseBlocks = fullResponse.content.filter(
                (block): block is Anthropic.Messages.ToolUseBlock =>
                  block.type === 'tool_use'
              );

              if (toolUseBlocks.length > 0) {
                // Notify client about tool execution
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    type: 'tool_start',
                    tools: toolUseBlocks.map(t => ({
                      name: t.name,
                      id: t.id
                    }))
                  })}\n\n`)
                );

                // Execute tools in parallel
                const toolResults = await Promise.all(
                  toolUseBlocks.map(async (toolUse) => {
                    try {
                      const result = await executeTool(toolUse.name, toolUse.input as Record<string, any>);

                      // Notify client of tool completion
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({
                          type: 'tool_complete',
                          name: toolUse.name,
                          success: result.success
                        })}\n\n`)
                      );

                      return {
                        type: 'tool_result' as const,
                        tool_use_id: toolUse.id,
                        content: JSON.stringify(
                          result.success ? result.data : { error: result.error }
                        )
                      };
                    } catch (error: any) {
                      console.error(`Tool execution failed: ${toolUse.name}`, error);
                      return {
                        type: 'tool_result' as const,
                        tool_use_id: toolUse.id,
                        content: JSON.stringify({
                          error: `Tool execution failed: ${error.message}`
                        })
                      };
                    }
                  })
                );

                // Add assistant response and tool results to message history
                currentMessages.push({
                  role: 'assistant',
                  content: fullResponse.content
                });

                currentMessages.push({
                  role: 'user',
                  content: toolResults
                });

                // Continue the loop to let Claude respond with tool results
                continue;
              }
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

        } catch (error: any) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              message: error.message || 'An error occurred'
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

  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
