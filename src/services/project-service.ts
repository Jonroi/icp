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
        };
      } catch (error) {
        console.error('Error loading competitor:', error);
        return null;
      }
    }
    return null;
  }
}
