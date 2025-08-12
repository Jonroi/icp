import { ApifyClient } from './apify-client';
import type { OwnCompany } from '@/services/project-service';

export interface CompanyDataResult {
  success: boolean;
  data: Partial<OwnCompany>;
  sources: string[];
  errors?: string[];
}

export interface ApifyCompanyData {
  name?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  description?: string;
  founded?: string;
  employees?: string;
  revenue?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export class CompanyDataFetcher {
  private apifyClient: ApifyClient;

  constructor() {
    this.apifyClient = new ApifyClient();
  }

  /**
   * Automatically fetch comprehensive company data from multiple sources
   */
  async fetchCompanyData(
    companyName: string,
    location?: string,
  ): Promise<CompanyDataResult> {
    console.log(`🔍 Fetching automated company data for: ${companyName}`);

    const results: Partial<OwnCompany> = {};
    const sources: string[] = [];
    const errors: string[] = [];

    try {
      // 1. Google Maps Business Data
      try {
        console.log(`📍 Fetching Google Maps business data...`);
        const googleData = await this.fetchGoogleMapsBusinessData(
          companyName,
          location,
        );
        if (googleData) {
          Object.assign(results, googleData);
          sources.push('Google Maps');
        }
      } catch (error) {
        errors.push(
          `Google Maps: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }

      // 2. LinkedIn Company Data
      try {
        console.log(`💼 Fetching LinkedIn company data...`);
        const linkedInData = await this.fetchLinkedInCompanyData(companyName);
        if (linkedInData) {
          Object.assign(results, linkedInData);
          sources.push('LinkedIn');
        }
      } catch (error) {
        errors.push(
          `LinkedIn: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }

      // 3. Crunchbase Data (if available)
      try {
        console.log(`💰 Fetching Crunchbase data...`);
        const crunchbaseData = await this.fetchCrunchbaseData(companyName);
        if (crunchbaseData) {
          Object.assign(results, crunchbaseData);
          sources.push('Crunchbase');
        }
      } catch (error) {
        errors.push(
          `Crunchbase: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }

      return {
        success: sources.length > 0,
        data: results,
        sources,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error(`❌ Company data fetching failed:`, error);
      return {
        success: false,
        data: {},
        sources: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Fetch business data from Google Maps
   */
  private async fetchGoogleMapsBusinessData(
    companyName: string,
    location?: string,
  ): Promise<Partial<OwnCompany> | null> {
    try {
      // Use Google Maps Reviews Scraper to get business details
      const searchQuery = location ? `${companyName} ${location}` : companyName;

      const result = await this.apifyClient.performGoogleMapsSearch(
        searchQuery,
        {
          location: location || 'Global',
          maxResults: 1, // We only need the business details, not reviews
        },
      );

      if (result.organic_results && result.organic_results.length > 0) {
        const place = result.organic_results[0];

        return {
          name: place.title || companyName,
          website: place.link || '',
          location: location || '',
          industry: this.extractIndustryFromCategories([]), // No categories available
          companySize: 'Unknown',
          // Additional data from Google Maps
          mainOfferings: place.snippet || '',
          uniqueFeatures: '',
        };
      }

      return null;
    } catch (error) {
      console.error('Google Maps business data fetch failed:', error);
      return null;
    }
  }

  /**
   * Fetch company data from LinkedIn
   */
  private async fetchLinkedInCompanyData(
    companyName: string,
  ): Promise<Partial<OwnCompany> | null> {
    try {
      // Use LinkedIn Company Scraper
      const result = await this.apifyClient.runLinkedInCompanyScraper(
        companyName,
      );

      if (result && result.length > 0) {
        const company = result[0];

        return {
          name: company.name || companyName,
          website: company.website || '',
          social: company.linkedinUrl || '',
          industry: company.industry || '',
          companySize: this.formatCompanySize(company.employeeCount),
          location: company.location || '',
          // LinkedIn specific data
          targetMarket: company.description || '',
          valueProposition: company.tagline || '',
          mainOfferings: company.specialties?.join(', ') || '',
        };
      }

      return null;
    } catch (error) {
      console.error('LinkedIn company data fetch failed:', error);
      return null;
    }
  }

  /**
   * Fetch company data from Crunchbase
   */
  private async fetchCrunchbaseData(
    _companyName: string,
  ): Promise<Partial<OwnCompany> | null> {
    try {
      // Note: This would require a Crunchbase scraper actor
      // For now, we'll return null as this requires additional setup
      console.log('Crunchbase integration not yet implemented');
      return null;
    } catch (error) {
      console.error('Crunchbase data fetch failed:', error);
      return null;
    }
  }

  /**
   * Extract industry from Google Maps categories
   */
  private extractIndustryFromCategories(categories?: string[]): string {
    if (!categories || categories.length === 0) return '';

    const category = categories[0];

    // Map Google Maps categories to our industry options
    const industryMap: Record<string, string> = {
      software: 'SaaS/Software',
      technology: 'Technology',
      health: 'Healthcare',
      medical: 'Healthcare',
      finance: 'Finance/Banking',
      banking: 'Finance/Banking',
      education: 'Education',
      manufacturing: 'Manufacturing',
      'real estate': 'Real Estate',
      marketing: 'Marketing/Advertising',
      consulting: 'Consulting',
      retail: 'Retail',
      media: 'Media/Entertainment',
      transportation: 'Transportation',
      energy: 'Energy',
    };

    const lowerCategory = category.toLowerCase();
    for (const [key, value] of Object.entries(industryMap)) {
      if (lowerCategory.includes(key)) {
        return value;
      }
    }

    return 'Other';
  }

  /**
   * Estimate company size from Google Maps data
   */
  private estimateCompanySize(_place: any): string {
    // This is a rough estimation based on available data
    // In a real implementation, you'd use more sophisticated logic

    if (_place.employeeCount) {
      const count = parseInt(_place.employeeCount);
      if (count <= 10) return 'Startup (1-10 employees)';
      if (count <= 50) return 'Small Business (11-50 employees)';
      if (count <= 200) return 'Medium Business (51-200 employees)';
      if (count <= 1000) return 'Large Business (201-1000 employees)';
      return 'Enterprise (1000+ employees)';
    }

    // Fallback based on business type or other indicators
    return 'Small Business (11-50 employees)';
  }

  /**
   * Format company size from LinkedIn data
   */
  private formatCompanySize(employeeCount?: string): string {
    if (!employeeCount) return '';

    // LinkedIn often provides ranges like "11-50 employees"
    if (employeeCount.includes('-')) {
      const [, max] = employeeCount.split('-').map((s) => parseInt(s));
      if (max <= 10) return 'Startup (1-10 employees)';
      if (max <= 50) return 'Small Business (11-50 employees)';
      if (max <= 200) return 'Medium Business (51-200 employees)';
      if (max <= 1000) return 'Large Business (201-1000 employees)';
      return 'Enterprise (1000+ employees)';
    }

    // Single number
    const count = parseInt(employeeCount);
    if (count <= 10) return 'Startup (1-10 employees)';
    if (count <= 50) return 'Small Business (11-50 employees)';
    if (count <= 200) return 'Medium Business (51-200 employees)';
    if (count <= 1000) return 'Large Business (201-1000 employees)';
    return 'Enterprise (1000+ employees)';
  }

  /**
   * Merge multiple data sources intelligently
   */
  private mergeCompanyData(
    sources: Partial<OwnCompany>[],
  ): Partial<OwnCompany> {
    const merged: Partial<OwnCompany> = {};

    // Merge fields, preferring more reliable sources
    for (const source of sources) {
      for (const [key, value] of Object.entries(source)) {
        if (value && !merged[key as keyof OwnCompany]) {
          merged[key as keyof OwnCompany] = value;
        }
      }
    }

    return merged;
  }
}
