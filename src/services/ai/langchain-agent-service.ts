import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { agentManager } from '@/components/agents/agent-manager';
import { langchainTools } from '@/services/ai/langchain-tools';

// Initialize the LLM (Ollama via OpenAI-compatible API)
const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'ollama',
  model: process.env.OLLAMA_MODEL || 'llama3.2:3b-instruct-q4_K_M',
  temperature: 0.7,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1',
  },
  streaming: true,
});

// Create the prompt template with variables for system message and chat history
const prompt = ChatPromptTemplate.fromMessages([
  ['system', '{system_message}'],
  new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
  new MessagesPlaceholder('agent_scratchpad'),
]);

// Cache for the agent executor to avoid recreating it every time
let agentExecutor: AgentExecutor | null = null;

// Create the agent
export async function createCompanyProfileAgent() {
  try {
    if (agentExecutor) {
      return agentExecutor;
    }

    console.log('🤖 Creating LangChain agent...');

    // Get agent configuration (for system prompt only)
    const agentConfig = agentManager.getAgent('company-profile-agent');
    if (!agentConfig) {
      throw new Error('Company profile agent not found');
    }

    // Prefer server-safe LangChain tools (prebuilt DynamicTool instances)
    const tools = langchainTools;

    const agent = await createOpenAIToolsAgent({
      llm,
      tools,
      prompt,
    });

    agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: true,
      maxIterations: 5, // Limit iterations to prevent infinite loops
    });

    console.log('🤖 LangChain agent created successfully');
    return agentExecutor;
  } catch (error) {
    console.error('Error creating LangChain agent:', error);
    throw error;
  }
}

// Function to run the agent
export async function runAgent(input: string) {
  try {
    console.log('🤖 Running agent with input:', input);

    const agent = await createCompanyProfileAgent();
    const systemPrompt =
      agentManager.getAgent('company-profile-agent')?.instructions ||
      'You are a helpful assistant.';
    const result = await agent.invoke({
      input,
      system_message: systemPrompt,
      chat_history: [],
    });

    console.log('🤖 Agent result:', result);
    return result.output;
  } catch (error) {
    console.error('Error running agent:', error);

    // Provide a more helpful error message
    if (error instanceof Error) {
      if (error.message.includes('agent_scratchpad')) {
        return "I'm sorry, there's a technical issue with the AI agent. Please try again or contact support.";
      }
      if (error.message.includes('chat_history')) {
        return "I'm sorry, there's a technical issue with the AI agent. Please try again or contact support.";
      }
      if (error.message.includes('fetch')) {
        return "I'm sorry, I'm having trouble connecting to the database. Please check your connection and try again.";
      }
    }

    return "I'm sorry, I encountered an error. Please try again.";
  }
}
