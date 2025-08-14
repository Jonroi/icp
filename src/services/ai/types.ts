export interface ICP {
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
