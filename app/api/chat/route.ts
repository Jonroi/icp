import { NextRequest } from 'next/server';
import { runAgent } from '@/services/ai/langchain-agent-service';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Get the last user message
    const lastUserMessage =
      messages.filter((m) => m.role === 'user').pop()?.content || '';

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'No user message found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('🤖 Running LangChain agent with input:', lastUserMessage);

    // Run the LangChain agent
    const agentResponse = await runAgent(lastUserMessage);

    console.log('🤖 Agent response:', agentResponse);

    return new Response(
      JSON.stringify({
        role: 'assistant',
        content: agentResponse,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(
      JSON.stringify({
        error: 'AI service error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
