export interface ICP {
  // Basic ICP info
  icp_id: string;
  icp_name: string;
  business_model: 'B2B' | 'B2C' | 'B2B2C';

  // Meta information
  meta: {
    generated_at: string;
    source_company: string;
    source_links?: {
      website?: string;
      linkedin?: string;
    };
  };

  // Segmentation
  segments: string[];

  // Fit definition
  fit_definition: {
    company_attributes: {
      industries: string[];
      company_sizes: string[];
      geographies: string[];
      tech_stack_hints?: string[];
      regulatory_context?: string[];
    };
    buyer_personas?: Array<{
      role: string;
      seniority?: string;
      dept?: string;
      decision_power?:
        | 'user'
        | 'influencer'
        | 'gatekeeper'
        | 'economic buyer'
        | 'decision maker';
    }>;
    consumer_persona?: {
      demographics?: Record<string, any>;
      psychographics?: string[];
      lifestyle?: string[];
    };
  };

  // Needs, pains, and goals
  needs_pain_goals: {
    pains: string[];
    jobs_to_be_done: string[];
    desired_outcomes: string[];
  };

  // Buying behavior
  buying_triggers: string[];
  common_objections: string[];

  // Value proposition alignment
  value_prop_alignment: {
    value_prop: string;
    unique_features: string[];
    competitive_advantages: string[];
  };

  // Offerings and pricing
  offerings_pricing: {
    main_offerings: string[];
    pricing_model: string;
    packaging_notes?: string;
  };

  // Go-to-market strategy
  go_to_market: {
    primary_channels: string[];
    messages: string[];
    content_ideas: string[];
  };

  // Fit scoring
  fit_scoring: {
    score: number; // 0-100
    score_breakdown: Record<string, number>;
  };

  // ABM tier
  abm_tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'N/A';

  // Confidence level
  confidence: 'high' | 'medium' | 'low';

  // Data sources used
  dataSources?: ApifyDataSource[];

  // Market insights
  marketInsights?: {
    trends: string[];
    opportunities: string[];
    threats: string[];
  };
}

// Legacy ICP interface for backward compatibility
export interface LegacyICP {
  name: string;
  description: string;
  demographics: {
    age: string;
    gender: string;
    location: string;
    income: string;
    education: string;
  };
  psychographics: {
    interests: string[];
    values: string[];
    lifestyle: string;
    painPoints: string[];
  };
  behavior: {
    onlineHabits: string[];
    purchasingBehavior: string;
    brandPreferences: string[];
  };
  goals: string[];
  challenges: string[];
  preferredChannels: string[];
}

// CompetitorData removed from active use; keep for backward compatibility
export interface CompetitorData {
  name: string;
  website: string;
  social: string;
}

export interface CompetitorAnalysis {
  targetAudience: string[];
  painPoints: string[];
  valueProposition: string;
  pricingStrategy: string;
  marketingChannels: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CustomerReview {
  text: string;
  source: string;
  rating?: number;
  date?: string;
  platform?: string;
  // Enhanced reviewer data from Google Maps
  reviewer?: {
    name?: string;
    id?: string;
    url?: string;
    profilePicture?: string;
    numberOfReviews?: number;
    isLocalGuide?: boolean;
    localGuideLevel?: number;
  };
  // Additional review metadata
  reviewId?: string;
  reviewUrl?: string;
  responseFromOwner?: string;
  images?: string[];
  reviewContext?: string;
  detailedRating?: {
    [service: string]: number;
  };
}

// Apify Google Maps API specific types
export interface ApifyDataSource {
  type:
    | 'apify_reviews'
    | 'apify_organic'
    | 'apify_market_data'
    | 'google_maps_reviews';
  query: string;
  location?: string;
  resultCount: number;
  timestamp: string;
}

export interface ApifyBasedICP extends ICP {
  dataSources: ApifyDataSource[];
  confidence: 'high' | 'medium' | 'low';
  marketInsights?: {
    trends: string[];
    opportunities: string[];
    threats: string[];
  };
}
