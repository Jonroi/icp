import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { DynamicTool } from '@langchain/core/tools';
import { agentManager } from '@/components/agents/agent-manager';

// Initialize the LLM (Ollama via OpenAI-compatible API)
const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'ollama',
  model: process.env.OLLAMA_MODEL || 'llama3.2:3b-instruct-q4_K_M',
  temperature: 0.7,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1',
  },
});

// Function to get the system prompt from agent configuration
function getSystemPrompt(): string {
  const agent = agentManager.getAgent('company-profile-agent');
  return agent?.instructions || 'You are a helpful assistant.';
}

// Create the prompt template with the required agent_scratchpad variable
const prompt = ChatPromptTemplate.fromMessages([
  ['system', getSystemPrompt()],
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

    // Get agent configuration
    const agentConfig = agentManager.getAgent('company-profile-agent');
    if (!agentConfig) {
      throw new Error('Company profile agent not found');
    }

    // Convert agent tools to LangChain tools
    const tools = agentConfig.tools.map(
      (tool) =>
        new DynamicTool({
          name: tool.name,
          description: tool.description,
          func: tool.execute,
        }),
    );

    const agent = await createOpenAIFunctionsAgent({
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
    const result = await agent.invoke({
      input,
      chat_history: [], // Provide empty chat history to fix the missing variable error
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
