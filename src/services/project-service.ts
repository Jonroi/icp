export interface GeneratedICP {
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

export interface GeneratedCampaign {
  adCopy: string;
  image: string;
  imageHint: string;
  cta: string;
  hooks: string;
  landingPageCopy: string;
}

export interface OwnCompany {
  id?: string;
  name: string;
  website: string;
  social: string;
  location?: string; // Target market location (where your customers are located)
  reviews?: string; // Customer reviews for the company
  linkedInData?: string; // LinkedIn insights and data
  additionalContext?: string; // Extra context stored on server

  // Enhanced business information for better ICP data
  industry?: string; // Industry/sector the company operates in
  companySize?: string; // Company size (startup, SME, enterprise, etc.)
  targetMarket?: string; // Primary target market description
  valueProposition?: string; // Core value proposition
  mainOfferings?: string; // Main products/services offered
  pricingModel?: string; // Pricing model (subscription, one-time, freemium, etc.)
  uniqueFeatures?: string; // Unique features or competitive advantages
  marketSegment?: string; // Market segment (B2B, B2C, specific verticals)
  competitiveAdvantages?: string; // Key competitive advantages
  currentCustomers?: string; // Description of current customer base
  successStories?: string; // Customer success stories or testimonials
  currentMarketingChannels?: string; // Current marketing channels being used
  marketingMessaging?: string; // Current marketing messaging/positioning
  painPointsSolved?: string; // Pain points the company solves for customers
  customerGoals?: string; // Goals customers achieve with the company's help
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
  language: string;
  source?: string;
  demographics?: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    location?: string;
    occupation?: string;
  };
}

export interface DemographicsAnalysis {
  agePatterns: string[];
  genderPatterns: string[];
  locationPatterns: string[];
  sentimentAnalysis: { positive: number; neutral: number; negative: number };
  sourceBreakdown: { [key: string]: number };
}

export interface CompetitorAnalysis {
  name: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  marketPosition: string;
}

export interface ProjectData {
  projectName: string;
  ownCompany?: OwnCompany;
  competitors: Competitor[];
  additionalContext: string;
  generatedICPs: GeneratedICP[];
  generatedCampaign: GeneratedCampaign | null;
  reviews: unknown[];
  demographicsAnalysis: unknown | null;
  competitorAnalysis: unknown[];
  savedAt: string;
}

export interface Competitor {
  name: string;
  website: string;
  social: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  reviews?: string;
  location?: string; // New field for location selection
  linkedInData?: string; // LinkedIn insights and data
}

export class ProjectService {}
