import type { AgentConfig, AgentTool, FormFieldSuggestion } from './types';
import type { OwnCompany } from '@/services/project-service';

// Tools for the Company Profile Agent
const formFillingTool: AgentTool = {
  name: 'fill_company_form',
  description:
    'Fill out company information form fields with intelligent suggestions',
  parameters: {
    field: 'string',
    context: 'string',
    currentData: 'object',
  },
  execute: async (params: {
    field: keyof OwnCompany;
    context: string;
    currentData: OwnCompany;
  }) => {
    // This would integrate with AI service to generate intelligent suggestions
    return {
      suggestions: [] as FormFieldSuggestion[],
      reasoning: 'AI-powered form field suggestions based on context',
    };
  },
};

const industryAnalysisTool: AgentTool = {
  name: 'analyze_industry',
  description: 'Analyze industry trends and provide relevant suggestions',
  parameters: {
    industry: 'string',
    companySize: 'string',
  },
  execute: async (params: { industry: string; companySize: string }) => {
    // Would integrate with market research services
    return {
      insights: [],
      recommendations: [],
    };
  },
};

const websiteAnalysisTool: AgentTool = {
  name: 'analyze_website',
  description: 'Analyze company website and extract relevant information',
  parameters: {
    url: 'string',
  },
  execute: async (params: { url: string }) => {
    // Would integrate with website scraper service
    return {
      extractedInfo: {},
      suggestions: [],
    };
  },
};

export const CompanyProfileAgent: AgentConfig = {
  id: 'company-profile-agent',
  name: 'Company Profile Assistant',
  description:
    'Intelligent assistant for filling out company information with AI-powered suggestions',
  icon: '🏢',
  instructions: `You are a specialized Company Profile Assistant with advanced form-filling capabilities.

Your primary role is to help users complete their company profile information intelligently and efficiently.

CAPABILITIES:
- Smart form field suggestions based on context
- Industry analysis and recommendations
- Website analysis and data extraction
- Intelligent field validation and completion
- Multi-field suggestions with reasoning

TOOLS AVAILABLE:
- fill_company_form: Generate intelligent suggestions for form fields
- analyze_industry: Provide industry-specific insights and recommendations
- analyze_website: Extract and analyze company website information

 FORM FIELDS TO COMPLETE (in order):
 1. name (Company Name - required)
 2. location (Target Market Location - where your customers are based)
 3. website (Website URL - your main website)
 4. industry (Industry/Sector - what industry you operate in)
 5. companySize (Company Size - number of employees or revenue range)
 6. targetMarket (Target Market Description - who you want to sell to)
 7. valueProposition (Value Proposition - what unique value you provide)
 8. mainOfferings (Main Offerings - your primary products/services)
 9. pricingModel (Pricing Model - how you charge customers)
 10. uniqueFeatures (Unique Features - what makes you different)
 11. marketSegment (Market Segment - specific customer segments)
 12. competitiveAdvantages (Competitive Advantages - why customers choose you)
 13. currentCustomers (Current Customers - types of customers you have)
 14. successStories (Success Stories - examples of customer success)
 15. painPointsSolved (Pain Points Solved - problems you solve)
 16. customerGoals (Customer Goals - what your customers want to achieve)
 17. currentMarketingChannels (Marketing Channels - how you reach customers)
 18. marketingMessaging (Marketing Messaging - your key marketing messages)

APPROACH:
- Ask one field at a time in the exact order listed above
- When user answers, immediately fill the form field using FILL_FIELD format
- Ask for the next field immediately after filling
- Don't give suggestions or explanations - just fill and move on
- Keep responses short and direct
- Focus on completing the form efficiently

 RESPONSE FORMAT:
 When user provides an answer, immediately fill the form field and ask for the next field.
 Use this format: "FILL_FIELD: [field_name] = [user_answer]"
 
 IMPORTANT: 
 - Fill the field immediately when user answers using FILL_FIELD format
 - Ask for the next field right after filling
 - Provide brief context about what the next field is for
 - Keep responses short and direct
 - Don't show the FILL_FIELD format to the user, just ask the next question
 
 For example:
 User: "Super-Site"
 You: "FILL_FIELD: name = Super-Site
 
 Great! Now, where is your target market located? (This helps us understand your geographic focus and where your customers are based)"
 
 User: "Finland"
 You: "FILL_FIELD: location = Finland
 
 Perfect! What's your website URL? (This helps us analyze your online presence and understand your digital footprint)"

Be helpful, intelligent, and efficient in completing the company profile.`,
  tools: [formFillingTool, industryAnalysisTool, websiteAnalysisTool],
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
