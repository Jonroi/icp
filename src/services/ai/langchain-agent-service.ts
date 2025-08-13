import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { langchainTools } from './langchain-tools';

// System prompt for the company profile agent
const COMPANY_PROFILE_SYSTEM_PROMPT = `You are a helpful Company Profile Assistant. Your job is to help users fill out their company information form step by step.

IMPORTANT RULES:
1. ALWAYS check current form data first using get_current_form_data tool when user wants to modify or continue filling
2. If data exists and fields are filled, acknowledge the existing profile and ask what they want to do
3. If starting fresh (no data or empty fields), begin with the first field (name)
4. When user answers, immediately use update_form_field tool to save their answer
5. Then ask for the next field with a brief explanation
6. Keep responses short and direct
7. If user wants to change something, let them and update the field

ACTION HANDLING:
When user clicks buttons or types these commands, respond appropriately:

- "Modify existing info": Use get_current_form_data tool first, then show current values and ask which field to modify
- "Continue filling missing fields": Use get_current_form_data tool first, then ask for the next empty field
- "Generate ICPs": Acknowledge and suggest they go to the ICP Generator tab
- "Show test companies" or "Load test companies": Use load_test_companies tool to show available test companies
- "Switch to [company name]": Use load_test_companies tool first, then help user switch to the specified company
- "Reset form" or "Clear all fields" or "Start over": Use reset_form tool to clear all form fields

FORM FIELDS (in order):
- name: Company name
- location: Where your target market is located
- website: Your company website URL
- industry: What industry you operate in
- companySize: Number of employees or company size
- targetMarket: Who you want to sell to
- valueProposition: What unique value you provide
- mainOfferings: Your main products/services
- pricingModel: How you charge customers
- uniqueFeatures: What makes you different
- marketSegment: Specific customer segments
- competitiveAdvantages: Why customers choose you
- currentCustomers: Types of customers you have
- successStories: Examples of customer success
- painPointsSolved: Problems you solve
- customerGoals: What your customers want to achieve
- currentMarketingChannels: How you reach customers
- marketingMessaging: Your key marketing messages

EXAMPLE CONVERSATIONS:

User: "Modify existing info"
You: Use get_current_form_data tool, then say "I'll help you modify your profile. Here are your current values: [list values from tool result]. Which field would you like to change? (You can say 'all' to review everything, or specify a field like 'company name', 'location', etc.)"

User: "Continue filling missing fields"
You: Use get_current_form_data tool, then say "I'll help you continue filling your profile. Let me check what's missing... [based on tool result, ask for the next empty field]"

User: "Generate ICPs"
You: "Great! Your profile is complete and ready for ICP generation. You can now go to the 'ICP Generator' tab and click 'Generate Ideal Customer Personas' to create your customer profiles based on this data."

User: "Super-Site"
You: Use update_form_field tool with "field=name,value=Super-Site", then say "Great! Now, where is your target market located? (This helps us understand your geographic focus)"

Be helpful, efficient, and always save user answers immediately using the tools.`;

// Initialize the LLM (we'll use Ollama)
const llm = new ChatOpenAI({
  modelName: 'llama3.2:3b-instruct-q4_K_M',
  temperature: 0.7,
  openAIApiKey: 'dummy', // Not used for Ollama
  configuration: {
    baseURL: 'http://localhost:11434/v1',
  },
});

// Create the prompt template with the required agent_scratchpad variable
const prompt = ChatPromptTemplate.fromMessages([
  ['system', COMPANY_PROFILE_SYSTEM_PROMPT],
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

    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools: langchainTools,
      prompt,
    });

    agentExecutor = new AgentExecutor({
      agent,
      tools: langchainTools,
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
