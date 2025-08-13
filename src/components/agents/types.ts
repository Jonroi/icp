import type { OwnCompany } from '@/services/project-service';
import type { ICP } from '@/services/ai/types';

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  instructions: string;
  tools: AgentTool[];
  suggestions: string[];
  placeholder: string;
  capabilities: string[];
}

export interface AgentResponse {
  type: 'message' | 'action' | 'suggestion' | 'form_update';
  content: string;
  data?: any;
  actions?: AgentAction[];
}

export interface AgentAction {
  type: 'fill_form' | 'analyze_data' | 'generate_content' | 'search_info';
  target: string;
  data: any;
}

export interface FormFieldSuggestion {
  field: keyof OwnCompany;
  value: string;
  confidence: number;
  reasoning?: string;
}

export interface ICPAnalysis {
  insights: string[];
  recommendations: string[];
  marketOpportunities: string[];
  risks: string[];
}

export interface CampaignSuggestion {
  theme: string;
  messaging: string[];
  channels: string[];
  targetAudience: string;
}
