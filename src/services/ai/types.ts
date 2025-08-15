// ICP Profile Types
export interface ICP {
  icp_id: string;
  icp_name: string;
  business_model: 'B2B' | 'B2C' | 'B2B2C';
  meta: {
    generated_at: string;
    source_company: string;
  };
  segments: string[];
  fit_definition: {
    company_attributes: {
      industries: string[];
      company_sizes: string[];
      geographies: string[];
      tech_stack_hints: string[];
    };
    buyer_personas: Array<{
      role: string;
      seniority: string;
      dept: string;
      decision_power: string;
    }>;
  };
  needs_pain_goals: {
    pains: string[];
    jobs_to_be_done: string[];
    desired_outcomes: string[];
  };
  buying_triggers: string[];
  common_objections: string[];
  value_prop_alignment: {
    value_prop: string;
    unique_features: string[];
    competitive_advantages: string[];
  };
  offerings_pricing: {
    main_offerings: string[];
    pricing_model: string;
    packaging_notes: string;
  };
  go_to_market: {
    primary_channels: string[];
    messages: string[];
    content_ideas: string[];
  };
  fit_scoring: {
    score: number;
    score_breakdown: {
      industry_fit: number;
      size_fit: number;
      geo_fit: number;
      pain_alignment: number;
      goal_alignment: number;
    };
  };
  abm_tier: string;
  confidence: 'high' | 'medium' | 'low';
}
