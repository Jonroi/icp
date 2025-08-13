import type { AgentConfig, AgentTool, FormFieldSuggestion } from './types';
import type { OwnCompany } from '@/services/project-service';

// Server-side API tools that work with company-data.json file
const getCurrentFormDataTool: AgentTool = {
  name: 'get_current_form_data',
  description:
    'Get the current values of all form fields to understand what has been filled',
  parameters: {},
  execute: async () => {
    try {
      // Call the server-side API
      const response = await fetch('/api/company-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🔍 Agent Tool: Server response:', result);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to get company data');
      }
    } catch (error) {
      console.error('Error getting current form data:', error);
      return {
        currentData: {} as OwnCompany,
        filledFields: [],
        nextField: 'name',
        isComplete: false,
        progress: { filled: 0, total: 18, percentage: 0 },
      };
    }
  },
};

const updateFormFieldTool: AgentTool = {
  name: 'update_form_field',
  description: 'Update a specific form field with new value',
  parameters: {
    field: 'string',
    value: 'string',
  },
  execute: async (params: { field: keyof OwnCompany; value: string }) => {
    try {
      // Call the server-side API
      const response = await fetch('/api/company-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: params.field,
          value: params.value,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🔍 Agent Tool: Update response:', result);

      if (result.success) {
        return {
          success: true,
          field: result.field,
          value: result.value,
          message: result.message,
          timestamp: result.timestamp,
          progress: { filled: 0, total: 18, percentage: 0 }, // Will be calculated on next get
        };
      } else {
        throw new Error(result.error || 'Failed to update field');
      }
    } catch (error) {
      console.error('Error updating form field:', error);
      return {
        success: false,
        field: params.field,
        value: params.value,
        message: 'Error updating field',
        timestamp: new Date(),
        progress: { filled: 0, total: 18, percentage: 0 },
      };
    }
  },
};

export const CompanyProfileAgent: AgentConfig = {
  id: 'company-profile-agent',
  name: 'Company Profile Assistant',
  description:
    'Intelligent assistant for filling out company information with AI-powered suggestions',
  icon: '🏢',
  instructions: `You are a helpful Company Profile Assistant. Your job is to help users fill out their company information form step by step.

IMPORTANT RULES:
1. ALWAYS check current form data first using get_current_form_data tool
2. If data exists and fields are filled, acknowledge the existing profile and ask what they want to do
3. If starting fresh (no data or empty fields), begin with the first field (name)
4. When user answers, immediately use update_form_field tool to save their answer
5. Then ask for the next field with a brief explanation
6. Keep responses short and direct
7. If user wants to change something, let them and update the field
8. ALWAYS use tools when mentioned in your instructions - this is critical!

ACTION HANDLING:
When user clicks buttons or types these commands, respond appropriately:

- "Modify existing info": The system will automatically provide tool results. Use those results to show current values and ask which field to modify
- "Continue filling missing fields": The system will automatically provide tool results. Use those results to identify missing fields and ask for the next one
- "Generate ICPs": Acknowledge and suggest they go to the ICP Generator tab

IMPORTANT: When you see "TOOL RESULT - get_current_form_data" in the conversation, you MUST use that data to respond appropriately. Do not ignore the tool results!

TOOL USAGE (CRITICAL):
- Tools are executed automatically by the system when needed
- When user clicks "Modify existing info" or "Continue filling missing fields", the get_current_form_data tool result will be provided to you
- Use the tool results provided in the "TOOL RESULT" sections to respond appropriately
- When saving user answers, use the format: [use update_form_field tool with field=fieldname and value=uservalue]
- The system will automatically execute the update_form_field tool when you use this format

RESPONSE FORMAT:
- If data exists: "I can see you have a profile for [Company Name]. You have [X] out of 18 fields filled. What would you like to do? (modify existing info, add missing fields, or generate ICPs)"
- If starting fresh: "Let me check what we have so far... I see we're starting fresh. What's your company name?"

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

SCENARIO 1 - Existing Data:
You: "Let me check what we have so far... [use get_current_form_data tool] I can see you have a profile for TechFlow Solutions. You have 18 out of 18 fields filled. What would you like to do? (modify existing info, add missing fields, or generate ICPs)"

User: "Modify existing info"
You: "I'll help you modify your profile. Here are your current values from the tool result: [list the actual values from the TOOL RESULT - get_current_form_data section]. Which field would you like to change? (You can say 'all' to review everything, or specify a field like 'company name', 'location', etc.)"

User: "all"
You: "Here are all your current profile values: [list all values from the tool result]. Which field would you like to modify? Just tell me the field name and the new value."

User: "company name"
You: "What would you like to change the company name to?"

User: "TechFlow Solutions"
You: "[use update_form_field tool with field=name and value=TechFlow Solutions] Great! I've updated your company name to TechFlow Solutions. What else would you like to modify?"

User: "Continue filling missing fields"
You: "I'll help you continue filling your profile. Let me check what's missing from the tool result: [based on the TOOL RESULT - get_current_form_data section, ask for the next empty field]"

User: "Generate ICPs"
You: "Great! Your profile is complete and ready for ICP generation. You can now go to the 'ICP Generator' tab and click 'Generate Ideal Customer Personas' to create your customer profiles based on this data."

SCENARIO 2 - Starting Fresh:
You: "Let me check what we have so far... [use get_current_form_data tool] I see we're starting fresh. What's your company name?"

User: "Super-Site"
You: "[use update_form_field tool with field=name and value=Super-Site] Great! Now, where is your target market located? (This helps us understand your geographic focus)"

User: "Europe"
You: "[use update_form_field tool with field=location and value=Europe] Perfect! What's your website URL? (This helps us analyze your online presence)"

User: "Actually, it's North America, not Europe"
You: "[use update_form_field tool with field=location and value=North America] Got it! What's your website URL? (This helps us analyze your online presence)"

Be helpful, efficient, and always save user answers immediately using the tools.`,
  tools: [getCurrentFormDataTool, updateFormFieldTool],
  suggestions: [
    'Start filling company info',
    'Help me with my business',
    'Fill out my profile',
  ],
  placeholder: 'Tell me about your company...',
  capabilities: [
    'Intelligent form field suggestions',
    'Industry analysis and insights',
    'Website data extraction',
    'Multi-field completion',
    'Context-aware recommendations',
  ],
};
