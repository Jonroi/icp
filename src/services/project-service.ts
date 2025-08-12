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
  name: string;
  website: string;
  social: string;
  location?: string; // Target market location (where your customers are located)
  reviews?: string; // Customer reviews for the company
  linkedInData?: string; // LinkedIn insights and data

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

export class ProjectService {
  static loadSavedProjectsList(): string[] {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith('project-'))
      .map((key) => key.replace('project-', ''));
  }

  static loadSavedCompetitorsList(): string[] {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith('competitor-'))
      .map((key) => key.replace('competitor-', ''));
  }

  static saveProject(projectData: ProjectData): void {
    const key = `project-${projectData.projectName}`;
    localStorage.setItem(key, JSON.stringify(projectData));
  }

  static loadProject(name: string): ProjectData | null {
    const key = `project-${name}`;
    const savedData = localStorage.getItem(key);

    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error loading project:', error);
        return null;
      }
    }
    return null;
  }

  static deleteProject(name: string): void {
    const key = `project-${name}`;
    localStorage.removeItem(key);
  }

  // Lightweight autosave for latest generated ICPs
  static saveLastICPs(icps: GeneratedICP[]): void {
    try {
      localStorage.setItem('last-generated-icps', JSON.stringify(icps));
    } catch (error) {
      console.error('Failed to autosave ICPs:', error);
    }
  }

  static loadLastICPs(): GeneratedICP[] {
    try {
      const raw = localStorage.getItem('last-generated-icps');
      return raw ? (JSON.parse(raw) as GeneratedICP[]) : [];
    } catch (error) {
      console.error('Failed to load autosaved ICPs:', error);
      return [];
    }
  }

  static saveCompetitor(competitor: Competitor): void {
    const competitorData = {
      name: competitor.name,
      website: competitor.website,
      social: competitor.social,
      location: competitor.location,
      savedAt: new Date().toISOString(),
    };
    const key = `competitor-${competitor.name}`;
    localStorage.setItem(key, JSON.stringify(competitorData));
  }

  static loadSavedCompetitor(competitorName: string): Competitor | null {
    const key = `competitor-${competitorName}`;
    const savedData = localStorage.getItem(key);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return {
          name: parsed.name || '',
          website: parsed.website || '',
          social: parsed.social || '',
          location: parsed.location || '',
        };
      } catch (error) {
        console.error('Error loading competitor:', error);
        return null;
      }
    }
    return null;
  }

  // Own company persistence (single entry)
  static saveOwnCompany(company: OwnCompany): void {
    const key = 'own-company';
    const payload = {
      // Basic Information
      name: company.name,
      website: company.website,
      social: company.social,
      location: company.location,

      // Enhanced Business Information
      industry: company.industry,
      companySize: company.companySize,
      targetMarket: company.targetMarket,
      valueProposition: company.valueProposition,
      mainOfferings: company.mainOfferings,
      pricingModel: company.pricingModel,
      uniqueFeatures: company.uniqueFeatures,
      marketSegment: company.marketSegment,
      competitiveAdvantages: company.competitiveAdvantages,

      // Customer Insights
      currentCustomers: company.currentCustomers,
      successStories: company.successStories,
      painPointsSolved: company.painPointsSolved,
      customerGoals: company.customerGoals,

      // Marketing Context
      currentMarketingChannels: company.currentMarketingChannels,
      marketingMessaging: company.marketingMessaging,

      // Additional Data
      reviews: company.reviews,
      linkedInData: company.linkedInData,

      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  }

  static loadOwnCompany(): OwnCompany | null {
    const key = 'own-company';
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return {
        // Basic Information
        name: parsed.name || '',
        website: parsed.website || '',
        social: parsed.social || '',
        location: parsed.location || '',

        // Enhanced Business Information
        industry: parsed.industry || '',
        companySize: parsed.companySize || '',
        targetMarket: parsed.targetMarket || '',
        valueProposition: parsed.valueProposition || '',
        mainOfferings: parsed.mainOfferings || '',
        pricingModel: parsed.pricingModel || '',
        uniqueFeatures: parsed.uniqueFeatures || '',
        marketSegment: parsed.marketSegment || '',
        competitiveAdvantages: parsed.competitiveAdvantages || '',

        // Customer Insights
        currentCustomers: parsed.currentCustomers || '',
        successStories: parsed.successStories || '',
        painPointsSolved: parsed.painPointsSolved || '',
        customerGoals: parsed.customerGoals || '',

        // Marketing Context
        currentMarketingChannels: parsed.currentMarketingChannels || '',
        marketingMessaging: parsed.marketingMessaging || '',

        // Additional Data
        reviews: parsed.reviews || '',
        linkedInData: parsed.linkedInData || '',
      };
    } catch (error) {
      console.error('Error loading own company:', error);
      return null;
    }
  }
}
