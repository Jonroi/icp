import type { AgentConfig, AgentTool, CampaignSuggestion } from './types';

// Tools for the Campaign Creator Agent
const campaignGeneratorTool: AgentTool = {
  name: 'generate_campaign_concepts',
  description:
    'Generate creative campaign concepts based on ICP and company data',
  parameters: {
    icpData: 'object',
    companyData: 'object',
    campaignType: 'string',
  },
  execute: async (params: {
    icpData: any;
    companyData: any;
    campaignType: string;
  }) => {
    // Would integrate with AI creative services
    return {
      concepts: [] as CampaignSuggestion[],
      themes: [] as string[],
      messaging: [] as string[],
    };
  },
};

const copywritingTool: AgentTool = {
  name: 'generate_ad_copy',
  description: 'Generate compelling ad copy and messaging',
  parameters: {
    targetAudience: 'string',
    valueProposition: 'string',
    campaignTheme: 'string',
  },
  execute: async (params: {
    targetAudience: string;
    valueProposition: string;
    campaignTheme: string;
  }) => {
    // Would integrate with copywriting AI services
    return {
      headlines: [] as string[],
      descriptions: [] as string[],
      callsToAction: [] as string[],
    };
  },
};

const channelOptimizationTool: AgentTool = {
  name: 'optimize_marketing_channels',
  description: 'Recommend optimal marketing channels for target audience',
  parameters: {
    targetAudience: 'object',
    budget: 'string',
    campaignGoals: 'string',
  },
  execute: async (params: {
    targetAudience: any;
    budget: string;
    campaignGoals: string;
  }) => {
    // Would integrate with channel analysis services
    return {
      recommendedChannels: [] as string[],
      budgetAllocation: {} as Record<string, number>,
      strategies: [] as string[],
    };
  },
};

export const CampaignCreatorAgent: AgentConfig = {
  id: 'campaign-creator-agent',
  name: 'Campaign Creator Pro',
  description:
    'Creative campaign development with AI-powered copywriting and channel optimization',
  icon: '🎯',
  instructions: `You are a Campaign Creator Pro with expertise in developing targeted marketing campaigns.

Your role is to create compelling, data-driven marketing campaigns that resonate with specific ICPs.

CAPABILITIES:
- Creative campaign concept generation
- AI-powered copywriting and messaging
- Marketing channel optimization
- Multi-channel campaign planning
- Performance-driven campaign design
- Creative direction and ideation

TOOLS AVAILABLE:
- generate_campaign_concepts: Create campaign themes and concepts
- generate_ad_copy: Write compelling ad copy and messaging
- optimize_marketing_channels: Recommend optimal channels and strategies

CAMPAIGN DEVELOPMENT PROCESS:
1. Audience Analysis
   - Understand ICP demographics and psychographics
   - Identify key pain points and motivations
   - Map customer journey and touchpoints

2. Creative Concept Development
   - Generate campaign themes and concepts
   - Create compelling value propositions
   - Develop unique selling propositions

3. Messaging Strategy
   - Craft targeted messaging for each audience segment
   - Create compelling headlines and descriptions
   - Develop effective calls-to-action

4. Channel Strategy
   - Identify optimal marketing channels
   - Plan multi-channel approach
   - Optimize budget allocation

5. Campaign Execution
   - Provide creative direction
   - Suggest campaign elements
   - Plan launch strategy

CREATIVE APPROACHES:
- Emotional storytelling
- Problem-solution framing
- Social proof and testimonials
- Urgency and scarcity tactics
- Educational content
- Interactive elements

RESPONSE FORMAT:
- Clear campaign concepts with reasoning
- Specific messaging recommendations
- Channel strategy with budget allocation
- Creative direction and next steps

Be creative, strategic, and results-focused in campaign development.`,
  tools: [campaignGeneratorTool, copywritingTool, channelOptimizationTool],
  suggestions: [
    'Create a marketing campaign for my ICP',
    'Generate compelling ad copy',
    'What messaging would resonate with my audience?',
    'Help me choose the best marketing channels',
    'Create a multi-channel campaign strategy',
    'Generate campaign themes and concepts',
    'Write headlines and descriptions',
    'Plan my campaign budget allocation',
    'Create a launch strategy',
    'How do I optimize my campaign performance?',
  ],
  placeholder: 'Tell me about your campaign goals or ask for creative ideas...',
  capabilities: [
    'Creative campaign generation',
    'AI-powered copywriting',
    'Channel optimization',
    'Multi-channel strategy',
    'Performance-driven design',
  ],
};
