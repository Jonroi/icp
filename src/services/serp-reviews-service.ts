import { SerpApiClient, type SerpReviewResult } from './ai/serp-client';
import { type CustomerReview, type SerpDataSource } from './ai/types';
import { AIServiceErrorFactory, InputValidator } from './ai/error-types';

interface SerpReviewsResult {
  reviews: CustomerReview[];
  dataSources: SerpDataSource[];
  metadata: {
    totalResults: number;
    searchQueries: string[];
    location: string;
    timestamp: string;
  };
}

export class SerpReviewsService {
  private static serpClient = new SerpApiClient();

  /**
   * Fetch customer reviews using SERP API instead of web scraping
   * This is the main replacement for the original ReviewsService
   */
  static async fetchCustomerReviews(
    companyName: string,
    options: {
      website?: string;
      location?: string;
      maxResults?: number;
      includeMarketData?: boolean;
    } = {
      includeMarketData: false, // Disable market data by default
    },
  ): Promise<string> {
    console.log(`🔍 SERP: Fetching reviews for ${companyName}`);

    // Validate input
    const companyValidation = InputValidator.validateCompanyName(companyName);
    if (!companyValidation.isValid) {
      throw AIServiceErrorFactory.createReviewCollectionError(
        'INVALID_COMPANY_NAME',
        `Invalid company name: ${companyValidation.errors
          .map((e) => e.message)
          .join(', ')}`,
        undefined,
        undefined,
      );
    }

    try {
      const result = await this.collectSerpReviews(companyName, options);

      if (result.reviews.length === 0) {
        throw AIServiceErrorFactory.createReviewCollectionError(
          'NO_REVIEWS_FOUND',
          `No reviews found for ${companyName} via SERP API`,
          'serp_api',
          result.metadata.searchQueries,
        );
      }

      console.log(
        `✅ SERP: Collected ${result.reviews.length} reviews from ${result.dataSources.length} search queries`,
      );

      // Convert to the expected string format for backward compatibility
      return this.formatReviewsForLLM(result);
    } catch (error) {
      console.error('SERP Reviews collection failed:', error);

      if (error instanceof Error && 'code' in error) {
        throw error; // Re-throw our custom errors
      }

      throw AIServiceErrorFactory.createReviewCollectionError(
        'SERP_API_ERROR',
        `SERP API collection failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        'serp_api',
        [companyName],
      );
    }
  }

  /**
   * Enhanced method that returns structured data for advanced use cases
   */
  static async fetchStructuredReviews(
    companyName: string,
    options: {
      website?: string;
      location?: string;
      maxResults?: number;
      includeMarketData?: boolean;
      includeCompetitorData?: boolean;
    } = {
      includeMarketData: false, // Disable market data by default
      includeCompetitorData: false, // Disable competitor data by default
    },
  ): Promise<SerpReviewsResult> {
    console.log(`🔍 SERP: Fetching structured reviews for ${companyName}`);
    return this.collectSerpReviews(companyName, options);
  }

  private static async collectSerpReviews(
    companyName: string,
    options: {
      website?: string;
      location?: string;
      maxResults?: number;
      includeMarketData?: boolean;
      includeCompetitorData?: boolean;
    } = {},
  ): Promise<SerpReviewsResult> {
    const location = options.location || 'United States'; // Global default
    const maxResults = options.maxResults || 25;
    const includeMarketData = options.includeMarketData === true; // Explicitly check for true
    const includeCompetitorData = options.includeCompetitorData === true; // Explicitly check for true
    const timestamp = new Date().toISOString();

    console.log(
      `🔧 Debug: includeMarketData=${includeMarketData}, includeCompetitorData=${includeCompetitorData}`,
    );

    // Step 1: Collect Google Places reviews first (highest priority)
    console.log(`🗺️ SERP: Searching Google Places reviews...`);
    const googlePlacesReviews = await this.serpClient.searchGooglePlacesReviews(
      companyName,
      {
        location,
        maxResults: Math.floor(maxResults * 0.4), // 40% for Google Places
      },
    );

    // Step 2: Collect other customer reviews
    console.log(`📊 SERP: Searching other customer reviews...`);
    const otherReviews = await this.serpClient.searchCompanyReviews(
      companyName,
      {
        location,
        maxResults: Math.floor(maxResults * 0.3), // 30% for other reviews
      },
    );

    const serpReviews = [...googlePlacesReviews, ...otherReviews];

    // Step 2: Collect competitor and market data if requested
    const competitorData: SerpReviewResult[] = [];
    // TEMPORARILY DISABLED: Competitor data collection is causing issues
    // if (includeMarketData || includeCompetitorData) {
    //   console.log(`🏢 SERP: Searching competitor information...`);
    //   const competitorInfo = await this.serpClient.searchCompetitorInfo(
    //     companyName,
    //     {
    //       includeReviews: true,
    //       includePricing: includeMarketData,
    //       includeFeatures: includeMarketData,
    //       location,
    //     },
    //   );

    //   competitorData = competitorInfo.reviews;
    // }

    // Step 3: Collect market insights ONLY if explicitly requested (disabled by default)
    const marketInsights: SerpReviewResult[] = [];
    // TEMPORARILY DISABLED: Market insights collection is causing issues
    // if (includeMarketData) { // Use the variable we created
    //   console.log(`📈 SERP: Searching market insights...`);
    //   try {
    //     // Extract industry from company name or use generic terms
    //     const industry = this.extractIndustryFromCompany(companyName);
    //     const insights = await this.serpClient.searchMarketInsights(
    //       industry,
    //       ['customer experience', 'reviews', 'trends'],
    //       { location },
    //     );

    //     // Convert search results to review-like format for LLM processing
    //     marketInsights = insights.slice(0, 5).map((result) => ({
    //       text: `${result.title}: ${result.snippet}`,
    //       source: result.link,
    //       platform: 'Market Research',
    //     }));
    //   } catch (error) {
    //     console.warn('Market insights collection failed:', error);
    //   }
    // }

    // Step 4: Combine and process all data
    const allSerpData = [...serpReviews, ...competitorData, ...marketInsights];

    // Convert SERP results to CustomerReview format
    const reviews: CustomerReview[] = allSerpData.map((serpReview) => ({
      text: serpReview.text,
      source: serpReview.source,
      rating: serpReview.rating,
      date: serpReview.date,
      platform: serpReview.platform,
    }));

    // Create data source tracking
    const dataSources: SerpDataSource[] = [
      {
        type: 'google_places_reviews',
        query: `"${companyName}" site:google.com/maps/place`,
        location,
        resultCount: googlePlacesReviews.length,
        timestamp,
      },
      {
        type: 'serp_reviews',
        query: `"${companyName}" customer reviews feedback`,
        location,
        resultCount: otherReviews.length,
        timestamp,
      },
    ];

    // Competitor data source tracking removed since competitor data is disabled
    // if (competitorData.length > 0) {
    //   dataSources.push({
    //     type: 'serp_organic',
    //     query: `"${companyName}" competitor analysis`,
    //     location,
    //     resultCount: competitorData.length,
    //     timestamp,
    //   });
    // }

    // Market insights data source tracking removed since market insights are disabled
    // if (marketInsights.length > 0) {
    //   dataSources.push({
    //     type: 'serp_market_data',
    //     query: `${this.extractIndustryFromCompany(companyName)} market trends`,
    //     location,
    //     resultCount: marketInsights.length,
    //     timestamp,
    //   });
    // }

    return {
      reviews: reviews.slice(0, maxResults), // Limit final results
      dataSources,
      metadata: {
        totalResults: reviews.length,
        searchQueries: dataSources.map((ds) => ds.query),
        location,
        timestamp,
      },
    };
  }

  private static formatReviewsForLLM(result: SerpReviewsResult): string {
    const reviewTexts = result.reviews.map((review) => {
      let formattedReview = review.text;

      // Add metadata if available
      if (review.platform) {
        formattedReview = `[${review.platform}] ${formattedReview}`;
      }

      if (review.rating) {
        formattedReview = `${formattedReview} (Rating: ${review.rating}/5)`;
      }

      if (review.date) {
        formattedReview = `${formattedReview} (Date: ${review.date})`;
      }

      return formattedReview;
    });

    // Add metadata header for LLM context
    const header = [
      `=== CUSTOMER REVIEWS COLLECTED VIA SERP API ===`,
      `Company: Research target`,
      `Total Reviews: ${result.reviews.length}`,
      `Data Sources: ${result.dataSources.length} SERP searches`,
      `Location: ${result.metadata.location} (Global search)`,
      `Collection Time: ${new Date(
        result.metadata.timestamp,
      ).toLocaleString()}`,
      `Search Queries: ${result.metadata.searchQueries.join(', ')}`,
      `=== REVIEWS START ===`,
      '',
    ].join('\n');

    const footer = `\n=== REVIEWS END ===\nTotal: ${reviewTexts.length} customer reviews collected via SERP API`;

    return header + reviewTexts.join('\n\n') + footer;
  }

  private static extractIndustryFromCompany(companyName: string): string {
    const lowerName = companyName.toLowerCase();

    // Simple industry detection based on company name patterns
    if (
      lowerName.includes('tech') ||
      lowerName.includes('software') ||
      lowerName.includes('app')
    ) {
      return 'technology';
    }
    if (
      lowerName.includes('bank') ||
      lowerName.includes('finance') ||
      lowerName.includes('invest')
    ) {
      return 'finance';
    }
    if (
      lowerName.includes('health') ||
      lowerName.includes('medical') ||
      lowerName.includes('pharma')
    ) {
      return 'healthcare';
    }
    if (
      lowerName.includes('retail') ||
      lowerName.includes('shop') ||
      lowerName.includes('store')
    ) {
      return 'retail';
    }
    if (
      lowerName.includes('transport') ||
      lowerName.includes('logistics') ||
      lowerName.includes('delivery')
    ) {
      return 'logistics';
    }
    if (
      lowerName.includes('hotel') ||
      lowerName.includes('travel') ||
      lowerName.includes('tourism')
    ) {
      return 'travel';
    }

    // Default to business services
    return 'business services';
  }

  /**
   * Utility method to get SERP API client configuration
   */
  static getApiConfig(): {
    hasApiKey: boolean;
    provider: string;
    isConfigured: boolean;
  } {
    return {
      hasApiKey: Boolean(import.meta.env.VITE_SERP_API_KEY),
      provider: import.meta.env.VITE_SERP_PROVIDER || 'serpapi',
      isConfigured: Boolean(import.meta.env.VITE_SERP_API_KEY),
    };
  }

  /**
   * Test SERP API connectivity
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: {
      resultCount: number;
      provider: string;
    };
  }> {
    try {
      const testResult = await this.serpClient.searchCompanyReviews(
        "McDonald's",
        {
          location: 'United States',
          maxResults: 1,
        },
      );

      return {
        success: true,
        message: `SERP API test successful. Found ${testResult.length} test results.`,
        details: {
          resultCount: testResult.length,
          provider: import.meta.env.VITE_SERP_PROVIDER || 'serpapi',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `SERP API test failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  }
}
