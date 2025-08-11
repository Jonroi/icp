import { AIServiceErrorFactory, InputValidator } from './error-types';

export interface SerpApiConfig {
  apiKey: string;
  provider: 'serpapi' | 'scrapingbee' | 'valueserp' | 'searchapi';
  baseUrl?: string;
}

export interface SerpSearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  source?: string;
}

export interface SerpReviewResult {
  text: string;
  rating?: number;
  date?: string;
  source: string;
  platform: string;
}

export interface SerpApiResponse {
  organic_results?: SerpSearchResult[];
  reviews?: SerpReviewResult[];
  people_also_ask?: Array<{
    question: string;
    answer: string;
  }>;
  related_searches?: string[];
  search_metadata?: {
    query: string;
    total_results?: number;
  };
}

export class SerpApiClient {
  private config: SerpApiConfig;

  constructor(config?: Partial<SerpApiConfig>) {
    // Get configuration from environment or use defaults
    this.config = {
      apiKey: config?.apiKey || import.meta.env.VITE_SERP_API_KEY || '',
      provider:
        config?.provider ||
        (import.meta.env.VITE_SERP_PROVIDER as SerpApiConfig['provider']) ||
        'searchapi',
      baseUrl:
        config?.baseUrl ||
        this.getDefaultBaseUrl(config?.provider || 'searchapi'),
    };

    if (!this.config.apiKey) {
      console.warn(
        '⚠️ SERP API key not found. Set VITE_SERP_API_KEY environment variable.',
      );
    }
  }

  private getDefaultBaseUrl(provider: string): string {
    switch (provider) {
      case 'serpapi':
        return 'https://serpapi.com/search';
      case 'scrapingbee':
        return 'https://app.scrapingbee.com/api/v1/store/google';
      case 'valueserp':
        return 'https://api.valueserp.com/search';
      case 'searchapi':
        return 'https://www.searchapi.io/api/v1/search';
      default:
        return 'https://www.searchapi.io/api/v1/search';
    }
  }

  /**
   * Search for company reviews and customer feedback
   */
  async searchCompanyReviews(
    companyName: string,
    options: {
      location?: string;
      language?: string;
      maxResults?: number;
    } = {},
  ): Promise<SerpReviewResult[]> {
    console.log(`🔍 Searching reviews for: ${companyName}`);

    // Validate input
    const validation = InputValidator.validateCompanyName(companyName);
    if (!validation.isValid) {
      throw AIServiceErrorFactory.createReviewCollectionError(
        'INVALID_COMPANY_NAME',
        `Invalid company name: ${validation.errors
          .map((e) => e.message)
          .join(', ')}`,
        undefined,
        undefined,
      );
    }

    const queries = this.buildReviewSearchQueries(companyName);
    const allReviews: SerpReviewResult[] = [];

    for (const query of queries) {
      try {
        const results = await this.performSearch(query, {
          location: options.location || 'Finland',
          language: options.language || 'en',
          maxResults: Math.ceil((options.maxResults || 20) / queries.length),
        });

        const reviews = this.extractReviewsFromResults(results, companyName);
        allReviews.push(...reviews);

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`Failed to search for query "${query}":`, error);
        continue;
      }
    }

    // Remove duplicates and return top results
    const uniqueReviews = this.deduplicateReviews(allReviews);
    const topReviews = uniqueReviews.slice(0, options.maxResults || 20);

    console.log(
      `✅ Found ${topReviews.length} unique reviews for ${companyName}`,
    );
    return topReviews;
  }

  /**
   * Search for competitor information and market intelligence
   */
  async searchCompetitorInfo(
    companyName: string,
    options: {
      includeReviews?: boolean;
      includePricing?: boolean;
      includeFeatures?: boolean;
      location?: string;
    } = {},
  ): Promise<{
    basic_info: SerpSearchResult[];
    reviews: SerpReviewResult[];
    market_data: SerpSearchResult[];
  }> {
    console.log(`🏢 Searching competitor info for: ${companyName}`);

    const basicInfoQuery = `"${companyName}" company information`;
    const reviewsQuery = options.includeReviews
      ? `"${companyName}" reviews customer experience`
      : '';
    const marketQuery = `"${companyName}" pricing features competitors`;

    const tasks = [
      this.performSearch(basicInfoQuery, { location: options.location }),
    ];

    if (reviewsQuery) {
      tasks.push(
        this.performSearch(reviewsQuery, { location: options.location }),
      );
    }

    if (options.includePricing || options.includeFeatures) {
      tasks.push(
        this.performSearch(marketQuery, { location: options.location }),
      );
    }

    const results = await Promise.allSettled(tasks);

    return {
      basic_info:
        results[0]?.status === 'fulfilled'
          ? results[0].value.organic_results || []
          : [],
      reviews:
        results[1]?.status === 'fulfilled'
          ? this.extractReviewsFromResults(results[1].value, companyName)
          : [],
      market_data:
        results[2]?.status === 'fulfilled'
          ? results[2].value.organic_results || []
          : [],
    };
  }

  /**
   * Search specifically for Google Places reviews
   */
  async searchGooglePlacesReviews(
    companyName: string,
    options: {
      location?: string;
      maxResults?: number;
    } = {},
  ): Promise<SerpReviewResult[]> {
    console.log(`🗺️ Searching Google Places reviews for: ${companyName}`);

    const queries = [
      `"${companyName}" site:google.com/maps/place`,
      `"${companyName}" site:google.com/maps reviews`,
      `"${companyName}" google maps reviews`,
    ];

    const allReviews: SerpReviewResult[] = [];

    for (const query of queries) {
      try {
        const results = await this.performSearch(query, {
          location: options.location || 'Finland',
          maxResults: Math.ceil((options.maxResults || 10) / queries.length),
        });

        const reviews = this.extractReviewsFromResults(results, companyName);
        allReviews.push(...reviews);

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`Failed to search for query "${query}":`, error);
        continue;
      }
    }

    // Remove duplicates and return top results
    const uniqueReviews = this.deduplicateReviews(allReviews);
    const topReviews = uniqueReviews.slice(0, options.maxResults || 10);

    console.log(
      `✅ Found ${topReviews.length} Google Places reviews for ${companyName}`,
    );
    return topReviews;
  }

  /**
   * Search for industry trends and market insights
   */
  async searchMarketInsights(
    industry: string,
    keywords: string[],
    options: {
      location?: string;
      timeFrame?: 'past_day' | 'past_week' | 'past_month' | 'past_year';
    } = {},
  ): Promise<SerpSearchResult[]> {
    console.log(`📊 Searching market insights for: ${industry}`);

    const query = `${industry} market trends ${keywords.join(' ')} 2024`;

    const results = await this.performSearch(query, {
      location: options.location || 'Global',
      timeFrame: options.timeFrame,
    });

    return results.organic_results || [];
  }

  private buildReviewSearchQueries(companyName: string): string[] {
    return [
      // Google Places specific queries
      `"${companyName}" site:google.com/maps reviews`,
      `"${companyName}" site:google.com/maps/place`,
      // Trustpilot specific queries
      `"${companyName}" site:trustpilot.com reviews`,
      // General review site queries
      `"${companyName}" site:yelp.com reviews`,
      `"${companyName}" site:tripadvisor.com reviews`,
      // Finnish review sites
      `"${companyName}" site:suomi24.fi arvostelu`,
      `"${companyName}" site:plaza.fi arvio`,
      // Reddit and social media
      `"${companyName}" site:reddit.com reviews`,
      `"${companyName}" site:facebook.com reviews`,
      // Generic review queries (fallback)
      `"${companyName}" customer reviews -site:${companyName.toLowerCase()}.fi`,
      `"${companyName}" arvostelu kokemus -site:${companyName.toLowerCase()}.fi`,
    ];
  }

  private async performSearch(
    query: string,
    options: {
      location?: string;
      language?: string;
      timeFrame?: string;
      maxResults?: number;
    } = {},
  ): Promise<SerpApiResponse> {
    if (!this.config.apiKey) {
      throw AIServiceErrorFactory.createReviewCollectionError(
        'NO_API_KEY',
        'SERP API key not configured. Please set SERP_API_KEY environment variable.',
        'serp_api',
        [],
      );
    }

    const params = this.buildSearchParams(query, options);

    console.log(
      `🔍 SERP API search: "${query}" (${options.location || 'default'})`,
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${this.config.baseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'ICP-Builder/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `SERP API HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();

      console.log(
        `✅ SERP API returned ${data.organic_results?.length || 0} results`,
      );
      return data;
    } catch (error) {
      console.error('SERP API search failed:', error);
      throw AIServiceErrorFactory.createReviewCollectionError(
        'SERP_API_ERROR',
        `SERP API search failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        'serp_api',
        [query],
      );
    }
  }

  private buildSearchParams(
    query: string,
    options: {
      location?: string;
      language?: string;
      timeFrame?: string;
      maxResults?: number;
    },
  ): string {
    const params = new URLSearchParams();

    // Common parameters
    params.append('api_key', this.config.apiKey);
    params.append('q', query);

    // Provider-specific parameters
    if (this.config.provider === 'searchapi') {
      params.append('engine', 'google');
      params.append('location', options.location || 'Finland');
      params.append('hl', options.language || 'en');
      params.append('gl', 'fi');
      params.append('num', String(options.maxResults || 10));
      if (options.timeFrame) {
        params.append('tbs', this.getTimeFrameFilter(options.timeFrame));
      }
    } else if (this.config.provider === 'serpapi') {
      params.append('location', options.location || 'Finland');
      params.append('hl', options.language || 'en');
      params.append('gl', 'fi');
      params.append('num', String(options.maxResults || 10));
      params.append('engine', 'google');
      if (options.timeFrame) {
        params.append('tbs', this.getTimeFrameFilter(options.timeFrame));
      }
    } else {
      // Default parameters for other providers
      params.append('location', options.location || 'Finland');
      params.append('hl', options.language || 'en');
      params.append('gl', 'fi');
      params.append('num', String(options.maxResults || 10));
    }

    return params.toString();
  }

  private getTimeFrameFilter(timeFrame: string): string {
    switch (timeFrame) {
      case 'past_day':
        return 'qdr:d';
      case 'past_week':
        return 'qdr:w';
      case 'past_month':
        return 'qdr:m';
      case 'past_year':
        return 'qdr:y';
      default:
        return '';
    }
  }

  private extractReviewsFromResults(
    results: SerpApiResponse,
    companyName: string,
  ): SerpReviewResult[] {
    const reviews: SerpReviewResult[] = [];

    // Extract from organic results
    if (results.organic_results) {
      for (const result of results.organic_results) {
        if (this.isReviewContent(result.snippet, companyName)) {
          reviews.push({
            text: result.snippet,
            source: result.link,
            platform: this.detectPlatform(result.link),
          });
        }
      }
    }

    // Extract from dedicated reviews section if available
    if (results.reviews) {
      reviews.push(...results.reviews);
    }

    return reviews;
  }

  private isReviewContent(snippet: string, companyName: string): boolean {
    const lowerSnippet = snippet.toLowerCase();
    const lowerCompany = companyName.toLowerCase();

    // Must mention the company
    if (!lowerSnippet.includes(lowerCompany)) return false;

    // Skip company website content
    const skipPhrases = [
      'official website',
      'visit website',
      'contact us',
      'about us',
      'our services',
      'company information',
      'business profile',
      'credit rating',
      'financial data',
      'market research',
      'industry trends',
      'customer experience trends',
    ];

    if (skipPhrases.some((phrase) => lowerSnippet.includes(phrase))) {
      return false;
    }

    // Must have personal experience indicators
    const personalExperienceIndicators = [
      'i ordered',
      'i used',
      'i tried',
      'i experienced',
      'my delivery',
      'my order',
      'my experience',
      'i was',
      'i had',
      'i received',
      'tilasin',
      'käytin',
      'kokemus',
      'toimitus',
      'tilaus',
    ];

    const hasPersonalExperience = personalExperienceIndicators.some(
      (indicator) => lowerSnippet.includes(indicator),
    );

    // Must have review-like content
    const reviewIndicators = [
      'review',
      'rating',
      'stars',
      'star',
      'experience',
      'customer',
      'service',
      'recommend',
      'satisfied',
      'disappointed',
      'excellent',
      'terrible',
      'good',
      'bad',
      'quality',
      'price',
      'delivery',
      'fast',
      'slow',
      'helpful',
      'friendly',
      'professional',
      // Finnish indicators
      'arvostelu',
      'arvio',
      'kokemus',
      'suosittele',
      'laatu',
      'hinta',
      'nopea',
      'hidas',
      'ystävällinen',
      'ammattitaitoinen',
    ];

    const hasReviewIndicators = reviewIndicators.some((indicator) =>
      lowerSnippet.includes(indicator),
    );

    // Must have both personal experience AND review indicators
    return hasPersonalExperience && hasReviewIndicators;
  }

  private detectPlatform(url: string): string {
    const domain = new URL(url).hostname.toLowerCase();

    if (domain.includes('trustpilot')) return 'Trustpilot';
    if (domain.includes('google')) return 'Google Reviews';
    if (domain.includes('facebook')) return 'Facebook';
    if (domain.includes('reddit')) return 'Reddit';
    if (domain.includes('linkedin')) return 'LinkedIn';
    if (domain.includes('yelp')) return 'Yelp';
    if (domain.includes('tripadvisor')) return 'TripAdvisor';

    return 'Web';
  }

  private deduplicateReviews(reviews: SerpReviewResult[]): SerpReviewResult[] {
    const seen = new Set<string>();
    const unique: SerpReviewResult[] = [];

    for (const review of reviews) {
      // Create a simple hash of the review content
      const hash = review.text
        .substring(0, 50)
        .toLowerCase()
        .replace(/\s+/g, ' ');

      if (!seen.has(hash) && review.text.length >= 50) {
        seen.add(hash);
        unique.push(review);
      }
    }

    return unique;
  }
}
