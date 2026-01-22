// Tool Executor - Routes AI tool calls to appropriate API endpoints

type ToolResult = { success: boolean; data?: any; error?: string };

export async function executeTool(
  name: string,
  input: Record<string, any>
): Promise<ToolResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  try {
    const response = await fetch(`${baseUrl}/api/tools/${name}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input)
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || data.message || 'Tool execution failed' 
      };
    }

    return { success: true, data };

  } catch (error: any) {
    console.error(`Tool execution error (${name}):`, error);
    return { 
      success: false, 
      error: error.message || 'Network error during tool execution' 
    };
  }
}

// Helper function to validate required fields
export function validateRequiredFields(
  input: Record<string, any>,
  required: string[]
): { valid: boolean; missing?: string[] } {
  const missing = required.filter(field => !input[field]);
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  
  return { valid: true };
}

// Helper to log tool calls for audit trail
export async function logToolCall(
  toolName: string,
  input: any,
  output: any,
  userId?: string
) {
  try {
    await fetch('/api/audit/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action: `tool_call_${toolName}`,
        entity: 'tool',
        entityId: toolName,
        details: { input, output },
        ipAddress: typeof window !== 'undefined' ? window.location.hostname : 'server'
      })
    });
  } catch (error) {
    console.error('Failed to log tool call:', error);
  }
}
