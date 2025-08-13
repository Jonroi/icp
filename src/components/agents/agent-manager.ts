import type { AgentConfig, AgentTool, AgentResponse } from './types';
import { CompanyProfileAgent } from './company-profile-agent';
import { ICPAnalyzerAgent } from './icp-analyzer-agent';
import { CampaignCreatorAgent } from './campaign-creator-agent';
import { ResearchAgent } from './research-agent';
import { GeneralGuideAgent } from './general-guide-agent';

export class AgentManager {
  private agents: Map<string, AgentConfig> = new Map();

  constructor() {
    // Register all agents
    this.registerAgent(CompanyProfileAgent);
    this.registerAgent(ICPAnalyzerAgent);
    this.registerAgent(CampaignCreatorAgent);
    this.registerAgent(ResearchAgent);
    this.registerAgent(GeneralGuideAgent);
  }

  registerAgent(agent: AgentConfig): void {
    this.agents.set(agent.id, agent);
  }

  getAgent(agentId: string): AgentConfig | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): AgentConfig[] {
    return Array.from(this.agents.values());
  }

  getAgentByType(type: string): AgentConfig | undefined {
    // Map old assistant types to new agent IDs
    const typeMapping: Record<string, string> = {
      'icp-form-tool': 'company-profile-agent',
      'icp-analysis-tool': 'icp-analyzer-agent',
      'campaign-creation-tool': 'campaign-creator-agent',
      'campaign-research-tool': 'research-agent',
      'general-guide': 'general-guide-agent',
    };

    const agentId = typeMapping[type] || type;
    return this.getAgent(agentId);
  }

  async executeTool(
    agentId: string,
    toolName: string,
    parameters: any,
  ): Promise<any> {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const tool = agent.tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found in agent ${agentId}`);
    }

    try {
      return await tool.execute(parameters);
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      throw error;
    }
  }

  getAgentSuggestions(agentId: string): string[] {
    const agent = this.getAgent(agentId);
    return agent?.suggestions || [];
  }

  getAgentCapabilities(agentId: string): string[] {
    const agent = this.getAgent(agentId);
    return agent?.capabilities || [];
  }

  // Helper method to get agent recommendations based on user query
  async recommendAgent(
    userQuery: string,
    context?: any,
  ): Promise<{
    recommendedAgent: AgentConfig;
    confidence: number;
    reasoning: string;
  }> {
    // Simple keyword-based recommendation logic
    // In a real implementation, this would use AI to analyze the query
    const query = userQuery.toLowerCase();

    if (
      query.includes('company') ||
      query.includes('form') ||
      query.includes('fill')
    ) {
      return {
        recommendedAgent: CompanyProfileAgent,
        confidence: 0.9,
        reasoning: 'User is asking about company information or form filling',
      };
    }

    if (
      query.includes('analyze') ||
      query.includes('icp') ||
      query.includes('profile')
    ) {
      return {
        recommendedAgent: ICPAnalyzerAgent,
        confidence: 0.8,
        reasoning: 'User is asking about ICP analysis or profile insights',
      };
    }

    if (
      query.includes('campaign') ||
      query.includes('marketing') ||
      query.includes('ad')
    ) {
      return {
        recommendedAgent: CampaignCreatorAgent,
        confidence: 0.85,
        reasoning: 'User is asking about marketing campaigns or advertising',
      };
    }

    if (
      query.includes('research') ||
      query.includes('market') ||
      query.includes('competitor')
    ) {
      return {
        recommendedAgent: ResearchAgent,
        confidence: 0.8,
        reasoning:
          'User is asking about market research or competitive analysis',
      };
    }

    // Default to general guide
    return {
      recommendedAgent: GeneralGuideAgent,
      confidence: 0.6,
      reasoning: 'User query is general, recommending the guide agent',
    };
  }
}

// Export singleton instance
export const agentManager = new AgentManager();

// Ensure agent manager is initialized
console.log(
  'Agent manager initialized with agents:',
  agentManager.getAllAgents().map((a) => a.id),
);
