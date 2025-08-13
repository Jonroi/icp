import { NextRequest } from 'next/server';
import { LangChainStream, StreamingTextResponse } from 'ai';
import { createCompanyProfileAgent } from '@/services/ai/langchain-agent-service';
import { agentManager } from '@/components/agents/agent-manager';
import { AIMessage, HumanMessage } from '@langchain/core/messages';

export const runtime = 'nodejs';

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

    const systemMessageFromRequest = messages.find(
      (m: any) => m.role === 'system',
    );
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const lastUserMessage =
      userMessages[userMessages.length - 1]?.content || '';

    // Build chat history excluding the last user message
    const history = messages
      .slice(0, messages.length - 1)
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) =>
        m.role === 'user'
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      );

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'No user message found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('🤖 Streaming LangChain agent with input:', lastUserMessage);

    const agent = await createCompanyProfileAgent();

    const { stream, handlers } = LangChainStream();

    // Kick off the agent invocation; stream tokens via handlers
    void agent
      .invoke(
        {
          input: lastUserMessage,
          system_message:
            systemMessageFromRequest?.content ||
            agentManager.getAgent('company-profile-agent')?.instructions ||
            'You are a helpful assistant.',
          chat_history: history,
        },
        { callbacks: [handlers] },
      )
      .catch((err: unknown) => {
        console.error('Agent streaming error:', err);
      });

    return new StreamingTextResponse(stream);
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
