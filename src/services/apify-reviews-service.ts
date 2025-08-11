import { ApifyClient, type ApifyReviewResult } from './ai/apify-client';
import { type CustomerReview, type ApifyDataSource } from './ai/types';
import { AIServiceErrorFactory, InputValidator } from './ai/error-types';

interface ApifyReviewsResult {
  reviews: CustomerReview[];
  dataSources: ApifyDataSource[];
  metadata: {
    totalResults: number;
    searchQueries: string[];
    location: string;
    timestamp: string;
    sentimentAnalysis?: {
      positive: number;
      negative: number;
      neutral: number;
      averageRating: number;
    };
    painPoints?: string[];
    keyInsights?: string[];
  };
}

interface ReviewAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  painPoints: string[];
  keyInsights: string[];
  rating: number;
}

export class ApifyReviewsService {
  private static apifyClient = new ApifyClient();
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 2000; // 2 seconds

  /**
   * Fetch customer reviews using Apify Google Maps API
   * This is the main service for collecting customer reviews
   */
  static async fetchCustomerReviews(
    companyName: string,
    options: {
      website?: string;
      location?: string;
      maxResults?: number;
      includeMarketData?: boolean;
      includeSentimentAnalysis?: boolean;
      includePainPoints?: boolean;
    } = {
      includeMarketData: false, // Disable market data by default (cost control)
      includeSentimentAnalysis: true, // Enable sentiment analysis by default
      includePainPoints: true, // Enable pain point extraction by default
    },
  ): Promise<string> {
    console.log(`🔍 Apify: Fetching reviews for ${companyName}`);

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

    // Use retry logic for better reliability
    return this.retryOperation(
      async () => {
        const result = await this.collectApifyReviews(companyName, options);

        if (result.reviews.length === 0) {
          throw AIServiceErrorFactory.createReviewCollectionError(
            'NO_REVIEWS_FOUND',
            `No reviews found for ${companyName} via Apify`,
            'apify',
            result.metadata.searchQueries,
          );
        }

        console.log(
          `✅ Apify: Collected ${result.reviews.length} reviews from ${result.dataSources.length} search queries`,
        );

        // Convert to the expected string format for backward compatibility
        return this.formatReviewsForLLM(result);
      },
      this.MAX_RETRIES,
      this.RETRY_DELAY,
    );
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
      includeSentimentAnalysis?: boolean;
      includePainPoints?: boolean;
    } = {
      includeMarketData: false, // Disable market data by default
      includeCompetitorData: false, // Disable competitor data by default
      includeSentimentAnalysis: true, // Enable sentiment analysis by default
      includePainPoints: true, // Enable pain point extraction by default
    },
  ): Promise<ApifyReviewsResult> {
    console.log(`🔍 Apify: Fetching structured reviews for ${companyName}`);

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

    // Use retry logic for better reliability
    return this.retryOperation(
      async () => {
        const result = await this.collectApifyReviews(companyName, options);

        if (result.reviews.length === 0) {
          throw AIServiceErrorFactory.createReviewCollectionError(
            'NO_REVIEWS_FOUND',
            `No reviews found for ${companyName} via Apify`,
            'apify',
            result.metadata.searchQueries,
          );
        }

        console.log(
          `✅ Apify: Collected ${result.reviews.length} structured reviews from ${result.dataSources.length} search queries`,
        );

        return result;
      },
      this.MAX_RETRIES,
      this.RETRY_DELAY,
    );
  }

  /**
   * Retry operation with exponential backoff
   */
  private static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    delay: number,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        // Preserve the original error structure
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          console.error(
            `❌ Apify: Operation failed after ${maxRetries} attempts:`,
            error,
          );
          throw error; // Throw the original error to preserve structure
        }

        console.warn(
          `⚠️ Apify: Attempt ${attempt} failed, retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    throw lastError!;
  }

  private static async collectApifyReviews(
    companyName: string,
    options: {
      website?: string;
      location?: string;
      maxResults?: number;
      includeMarketData?: boolean;
      includeCompetitorData?: boolean;
      includeSentimentAnalysis?: boolean;
      includePainPoints?: boolean;
    } = {},
  ): Promise<ApifyReviewsResult> {
    const location = options.location || 'Global'; // Default to Global instead of United States
    const maxResults = options.maxResults || 20; // Reduced to 20 for cost control
    const includeMarketData = options.includeMarketData === true; // Explicitly check for true
    const includeCompetitorData = options.includeCompetitorData === true; // Explicitly check for true
    const timestamp = new Date().toISOString();

    console.log(
      `🔧 Starting Google Maps Reviews for "${companyName}" in ${location}`,
    );

    // Step 1: Collect Google Places reviews ONLY (simplified approach)
    console.log(`🗺️ Apify: Searching Google Maps reviews only...`);
    const googlePlacesReviews =
      await this.apifyClient.searchGooglePlacesReviews(companyName, {
        location: location === 'Global' ? undefined : location, // Don't pass location for Global searches
        maxResults: maxResults, // Use all available slots for Google Maps
      });

    console.log(`✅ Found ${googlePlacesReviews.length} Google Maps reviews`);

    // Step 2: Skip other scrapers for now (to reduce costs and complexity)
    const apifyReviews = [...googlePlacesReviews];

    // Step 3: Skip competitor and market data collection (disabled for cost control)
    const competitorData: ApifyReviewResult[] = [];
    const marketInsights: ApifyReviewResult[] = [];

    // Step 4: Combine and process all data
    const allApifyData = [
      ...apifyReviews,
      ...competitorData,
      ...marketInsights,
    ];

    // Convert Apify results to CustomerReview format
    const reviews: CustomerReview[] = allApifyData.map((apifyReview) => ({
      text: apifyReview.text,
      source: apifyReview.source,
      rating: apifyReview.rating,
      date: apifyReview.date,
      platform: apifyReview.platform,
    }));

    // Create data source tracking (simplified)
    const dataSources: ApifyDataSource[] = [
      {
        type: 'google_maps_reviews',
        query: `"${companyName}" Google Maps reviews`,
        location,
        resultCount: googlePlacesReviews.length,
        timestamp,
      },
    ];

    // Perform sentiment analysis and pain point extraction if enabled
    let sentimentAnalysis;
    let painPoints: string[] = [];
    let keyInsights: string[] = [];

    if (options.includeSentimentAnalysis || options.includePainPoints) {
      const analysis = this.analyzeReviews(reviews);

      if (options.includeSentimentAnalysis) {
        sentimentAnalysis = analysis.sentimentAnalysis;
      }

      if (options.includePainPoints) {
        painPoints = analysis.painPoints;
        keyInsights = analysis.keyInsights;
      }
    }

    return {
      reviews: reviews.slice(0, maxResults), // Limit final results
      dataSources,
      metadata: {
        totalResults: reviews.length,
        searchQueries: dataSources.map((ds) => ds.query),
        location,
        timestamp,
        sentimentAnalysis,
        painPoints,
        keyInsights,
      },
    };
  }

  /**
   * Analyze reviews for sentiment, pain points, and key insights
   */
  private static analyzeReviews(reviews: CustomerReview[]): {
    sentimentAnalysis: {
      positive: number;
      negative: number;
      neutral: number;
      averageRating: number;
    };
    painPoints: string[];
    keyInsights: string[];
  } {
    const sentimentAnalysis = {
      positive: 0,
      negative: 0,
      neutral: 0,
      averageRating: 0,
    };

    const painPoints: string[] = [];
    const keyInsights: string[] = [];
    const painPointKeywords = [
      'problem',
      'issue',
      'difficult',
      'hard',
      'bad',
      'poor',
      'terrible',
      'awful',
      'horrible',
      'disappointing',
      'frustrating',
      'annoying',
      'slow',
      'expensive',
      'overpriced',
      'cheap',
      'quality',
      'broken',
      "doesn't work",
      'not working',
      'failed',
      'error',
      'bug',
      'customer service',
      'support',
      'wait',
      'delay',
      'late',
      'rude',
      'unhelpful',
      'unprofessional',
      'disappointed',
    ];

    const positiveKeywords = [
      'great',
      'excellent',
      'amazing',
      'wonderful',
      'fantastic',
      'perfect',
      'love',
      'awesome',
      'outstanding',
      'superb',
      'good',
      'nice',
      'helpful',
      'friendly',
      'professional',
      'fast',
      'quick',
      'efficient',
      'reliable',
      'trustworthy',
    ];

    const negativeKeywords = [
      'terrible',
      'awful',
      'horrible',
      'bad',
      'poor',
      'worst',
      'hate',
      'disappointing',
      'frustrating',
      'annoying',
      'useless',
      'waste',
      'money',
      'expensive',
      'overpriced',
    ];

    let totalRating = 0;
    let ratingCount = 0;

    reviews.forEach((review) => {
      const text = review.text.toLowerCase();

      // Analyze sentiment
      const positiveCount = positiveKeywords.filter((keyword) =>
        text.includes(keyword),
      ).length;
      const negativeCount = negativeKeywords.filter((keyword) =>
        text.includes(keyword),
      ).length;

      if (positiveCount > negativeCount) {
        sentimentAnalysis.positive++;
      } else if (negativeCount > positiveCount) {
        sentimentAnalysis.negative++;
      } else {
        sentimentAnalysis.neutral++;
      }

      // Extract pain points
      painPointKeywords.forEach((keyword) => {
        if (text.includes(keyword) && !painPoints.includes(keyword)) {
          painPoints.push(keyword);
        }
      });

      // Calculate average rating
      if (review.rating) {
        totalRating += review.rating;
        ratingCount++;
      }

      // Extract key insights (reviews with specific details)
      if (text.length > 50 && (positiveCount > 0 || negativeCount > 0)) {
        const sentences = review.text
          .split(/[.!?]+/)
          .filter((s) => s.trim().length > 20);
        sentences.forEach((sentence) => {
          const sentenceLower = sentence.toLowerCase();
          if (
            (positiveKeywords.some((k) => sentenceLower.includes(k)) ||
              negativeKeywords.some((k) => sentenceLower.includes(k))) &&
            !keyInsights.includes(sentence.trim())
          ) {
            keyInsights.push(sentence.trim());
          }
        });
      }
    });

    // Limit key insights to top 10
    keyInsights.splice(10);

    // Calculate average rating
    sentimentAnalysis.averageRating =
      ratingCount > 0 ? totalRating / ratingCount : 0;

    return {
      sentimentAnalysis,
      painPoints: painPoints.slice(0, 15), // Limit to top 15 pain points
      keyInsights,
    };
  }

  private static formatReviewsForLLM(result: ApifyReviewsResult): string {
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
      `=== CUSTOMER REVIEWS COLLECTED VIA APIFY ===`,
      `Company: Research target`,
      `Total Reviews: ${result.reviews.length}`,
      `Location: ${result.metadata.location} (Global search)`,
      `Collection Time: ${new Date(
        result.metadata.timestamp,
      ).toLocaleString()}`,
      `Search Queries: ${result.metadata.searchQueries.join(', ')}`,
    ];

    // Add sentiment analysis if available
    if (result.metadata.sentimentAnalysis) {
      const sa = result.metadata.sentimentAnalysis;
      header.push(
        `Sentiment Analysis:`,
        `  Positive: ${sa.positive} (${(
          (sa.positive / result.reviews.length) *
          100
        ).toFixed(1)}%)`,
        `  Negative: ${sa.negative} (${(
          (sa.negative / result.reviews.length) *
          100
        ).toFixed(1)}%)`,
        `  Neutral: ${sa.neutral} (${(
          (sa.neutral / result.reviews.length) *
          100
        ).toFixed(1)}%)`,
        `  Average Rating: ${sa.averageRating.toFixed(1)}/5`,
      );
    }

    // Add pain points if available
    if (result.metadata.painPoints && result.metadata.painPoints.length > 0) {
      header.push(`Key Pain Points: ${result.metadata.painPoints.join(', ')}`);
    }

    // Add key insights if available
    if (result.metadata.keyInsights && result.metadata.keyInsights.length > 0) {
      header.push(
        `Key Insights:`,
        ...result.metadata.keyInsights
          .slice(0, 3)
          .map((insight) => `  - ${insight}`),
      );
    }

    header.push(`=== REVIEWS START ===`, '');

    const footer = `\n=== REVIEWS END ===\nTotal: ${reviewTexts.length} customer reviews collected via Apify`;

    return header.join('\n') + reviewTexts.join('\n\n') + footer;
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
   * Utility method to get Apify client configuration
   */
  static getApiConfig(): {
    hasApiToken: boolean;
    actorId: string;
    isConfigured: boolean;
  } {
    const getApiToken = () => {
      // Try different ways to get the API token
      if (
        typeof import.meta !== 'undefined' &&
        import.meta.env?.VITE_APIFY_API_TOKEN
      ) {
        return import.meta.env.VITE_APIFY_API_TOKEN;
      }

      if (typeof process !== 'undefined' && process.env?.VITE_APIFY_API_TOKEN) {
        return process.env.VITE_APIFY_API_TOKEN;
      }

      return '';
    };

    const apiToken = getApiToken();

    return {
      hasApiToken: Boolean(apiToken),
      actorId: 'Xb8osYTtOjlsgI6k9', // Google Maps Reviews actor ID
      isConfigured: Boolean(apiToken),
    };
  }

  /**
   * Test Apify connectivity
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: {
      resultCount: number;
      actorId: string;
    };
  }> {
    try {
      const testResult = await this.apifyClient.testConnection();

      if (testResult.success) {
        return {
          success: true,
          message: `Apify test successful. ${testResult.message}`,
          details: {
            resultCount: 1, // We don't get exact count from test
            actorId: testResult.details?.actorId || 'Xb8osYTtOjlsgI6k9',
          },
        };
      } else {
        return {
          success: false,
          message: testResult.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Apify test failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  }
}
