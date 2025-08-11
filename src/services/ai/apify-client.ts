import { AIServiceErrorFactory, InputValidator } from './error-types';

export interface ApifyConfig {
  apiToken: string;
  actorId: string;
  baseUrl?: string;
}

export interface ApifySearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  source?: string;
}

export interface ApifyReviewResult {
  text: string;
  rating?: number;
  date?: string;
  source: string;
  platform: string;
}

export interface ApifyApiResponse {
  organic_results?: ApifySearchResult[];
  reviews?: ApifyReviewResult[];
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

export interface ApifyRunInput {
  // Google Search Results Scraper parameters
  queries?: string;
  query?: string;
  location?: string;
  language?: string;
  maxResults?: number;
  timeFrame?: string;
  customDataFunction?: string;

  // Google Maps Reviews Scraper parameters (optimized)
  searchStringsArray?: string[];
  startUrls?: Array<{ url: string; method?: string }>;
  maxCrawledPlaces?: number;
  includeReviews?: boolean;
  maxReviews?: number;
  reviewsLanguage?: string;
  reviewsSort?: string;
  includeBusinessInfo?: boolean;
  includePhotos?: boolean;
  personalData?: boolean;
  headless?: boolean;
  maxConcurrency?: number;
  maxRequestRetries?: number;
  requestTimeoutSecs?: number;
  proxyConfiguration?: {
    useApifyProxy: boolean;
    apifyProxyGroups: string[];
  };

  // Legacy parameters (for backward compatibility)
  businessName?: string;
  placeId?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface ApifyRunResult {
  id: string;
  status: 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'ABORTED' | 'TIMED-OUT';
  defaultDatasetId?: string;
  datasetId?: string; // For backward compatibility
  datasetItems?: any[];
  errorMessage?: string;
}

export class ApifyClient {
  private config: ApifyConfig;

  constructor(config?: Partial<ApifyConfig>) {
    // Get configuration from environment or use defaults
    const getApiToken = () => {
      if (config?.apiToken) return config.apiToken;

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

    this.config = {
      apiToken: getApiToken(),
      actorId: config?.actorId || 'Xb8osYTtOjlsgI6k9', // Google Maps Reviews Scraper
      baseUrl: config?.baseUrl || 'https://api.apify.com/v2',
    };

    if (!this.config.apiToken) {
      console.warn(
        '⚠️ Apify API token not found. Set VITE_APIFY_API_TOKEN environment variable.',
      );
    }
  }

  /**
   * Search for company reviews using Google Maps via Apify
   */
  async searchCompanyReviews(
    companyName: string,
    options: {
      location?: string;
      language?: string;
      maxResults?: number;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    } = {},
  ): Promise<ApifyReviewResult[]> {
    console.log(`🔍 Apify Google Maps: Searching reviews for: ${companyName}`);

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

    try {
      const results = await this.performGoogleMapsSearch(companyName, {
        location: options.location || 'United States',
        language: options.language || 'en',
        maxResults: options.maxResults || 20,
        address: options.address,
        city: options.city,
        state: options.state,
        country: options.country,
      });

      const reviews = this.extractReviewsFromResults(results, companyName);
      const uniqueReviews = this.deduplicateReviews(reviews);
      const topReviews = uniqueReviews.slice(0, options.maxResults || 20);

      console.log(
        `✅ Apify Google Maps: Found ${topReviews.length} unique reviews for ${companyName}`,
      );
      return topReviews;
    } catch (error) {
      console.error(
        `Failed to search Google Maps reviews for "${companyName}":`,
        error,
      );
      throw error;
    }
  }

  /**
   * Search specifically for Google Maps reviews using Apify
   */
  async searchGooglePlacesReviews(
    companyName: string,
    options: {
      location?: string;
      maxResults?: number;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    } = {},
  ): Promise<ApifyReviewResult[]> {
    console.log(`🗺️ Apify Google Maps: Searching reviews for: ${companyName}`);

    try {
      const results = await this.performGoogleMapsSearch(companyName, {
        location: options.location || 'United States',
        maxResults: options.maxResults || 10,
        address: options.address,
        city: options.city,
        state: options.state,
        country: options.country,
      });

      const reviews = this.extractReviewsFromResults(results, companyName);
      const uniqueReviews = this.deduplicateReviews(reviews);
      const topReviews = uniqueReviews.slice(0, options.maxResults || 10);

      console.log(
        `✅ Apify Google Maps: Found ${topReviews.length} reviews for ${companyName}`,
      );
      return topReviews;
    } catch (error) {
      console.error(
        `Failed to search Google Maps reviews for "${companyName}":`,
        error,
      );
      throw error;
    }
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
    basic_info: ApifySearchResult[];
    reviews: ApifyReviewResult[];
    market_data: ApifySearchResult[];
  }> {
    console.log(`🏢 Apify: Searching competitor info for: ${companyName}`);

    const basicInfoQuery = `"${companyName}" company information`;
    const reviewsQuery = options.includeReviews
      ? `"${companyName}" reviews customer experience`
      : '';
    const marketQuery = `"${companyName}" pricing features competitors`;

    const tasks = [
      this.performApifySearch(basicInfoQuery, { location: options.location }),
    ];

    if (reviewsQuery) {
      tasks.push(
        this.performApifySearch(reviewsQuery, { location: options.location }),
      );
    }

    if (options.includePricing || options.includeFeatures) {
      tasks.push(
        this.performApifySearch(marketQuery, { location: options.location }),
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
   * Search for industry trends and market insights
   */
  async searchMarketInsights(
    industry: string,
    keywords: string[],
    options: {
      location?: string;
      timeFrame?: 'past_day' | 'past_week' | 'past_month' | 'past_year';
    } = {},
  ): Promise<ApifySearchResult[]> {
    console.log(`📊 Apify: Searching market insights for: ${industry}`);

    const query = `${industry} market trends ${keywords.join(' ')} 2024`;

    const results = await this.performApifySearch(query, {
      location: options.location || 'Global',
      timeFrame: options.timeFrame,
    });

    return results.organic_results || [];
  }

  private async performGoogleMapsSearch(
    businessName: string,
    options: {
      location?: string;
      language?: string;
      maxResults?: number;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    } = {},
  ): Promise<ApifyApiResponse> {
    if (!this.config.apiToken) {
      throw AIServiceErrorFactory.createReviewCollectionError(
        'NO_API_KEY',
        'Apify API token not configured. Please set VITE_APIFY_API_TOKEN environment variable.',
        'apify',
        [],
      );
    }

    console.log(
      `🗺️ Apify Google Maps: "${businessName}" (${
        options.location || 'default'
      })`,
    );

    try {
      // Step 1: Start the Apify Google Maps Reviews Scraper with optimized settings
      // Use just the business name for global search (location is handled by the scraper)
      const searchString = businessName;

      const runInput: ApifyRunInput = {
        // Use searchStringsArray for better accuracy
        searchStringsArray: [searchString],
        maxCrawledPlaces: 1,
        includeReviews: true,
        maxReviews: options.maxResults || 20,
        reviewsLanguage: 'all',
        reviewsSort: 'newest',
        includeBusinessInfo: true,
        includePhotos: false,
        personalData: false,
        headless: true,
        language: options.language || 'en',
        maxConcurrency: 1,
        maxRequestRetries: 5,
        requestTimeoutSecs: 180,
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        },
      };

      console.log(
        `🔧 Starting Google Maps Reviews with optimized input:`,
        runInput,
      );
      const runResult = await this.startApifyRun(runInput, 'Xb8osYTtOjlsgI6k9');

      if (!runResult || !runResult.id) {
        throw new Error('Failed to get valid run ID from Apify');
      }

      console.log(`🆔 Apify run ID: ${runResult.id}`);

      // Step 2: Wait for the run to complete
      const completedRun = await this.waitForRunCompletion(
        runResult.id,
        300000,
        'Xb8osYTtOjlsgI6k9',
      );

      if (completedRun.status !== 'SUCCEEDED') {
        throw new Error(
          `Apify Google Maps Reviews run failed with status: ${
            completedRun.status
          }. ${completedRun.errorMessage || ''}`,
        );
      }

      // Step 3: Get the results
      if (!completedRun.defaultDatasetId) {
        throw new Error(
          'No dataset ID found in completed run. Cannot fetch results.',
        );
      }
      console.log(
        `📊 Getting results from dataset: ${completedRun.defaultDatasetId}`,
      );
      const results = await this.getRunResults(completedRun.defaultDatasetId);

      console.log(
        `✅ Apify Google Maps Reviews returned ${results.length} results for business: "${businessName}"`,
      );

      // Convert Google Maps Reviews to our expected format
      return this.convertGoogleMapsResultsToApifyFormat(results, businessName);
    } catch (error) {
      console.error('Apify Google Maps Reviews failed:', error);
      throw AIServiceErrorFactory.createReviewCollectionError(
        'APIFY_API_ERROR',
        `Apify Google Maps Reviews failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        'apify',
        [businessName],
      );
    }
  }

  private async performApifySearch(
    query: string,
    options: {
      location?: string;
      language?: string;
      timeFrame?: string;
      maxResults?: number;
    } = {},
  ): Promise<ApifyApiResponse> {
    if (!this.config.apiToken) {
      throw AIServiceErrorFactory.createReviewCollectionError(
        'NO_API_KEY',
        'Apify API token not configured. Please set VITE_APIFY_API_TOKEN environment variable.',
        'apify',
        [],
      );
    }

    console.log(
      `🔍 Apify Google Search: "${query}" (${options.location || 'default'})`,
    );

    try {
      // For general searches, use the Google Search Results Scraper (explicit actor)
      const googleSearchActor = 'apify~google-search-scraper';

      // Step 1: Start the Google Search Results Scraper
      const runInput: ApifyRunInput = {
        queries: query,
        location: options.location || 'United States',
        language: options.language || 'en',
        maxResults: options.maxResults || 20,
        timeFrame: options.timeFrame,
      };

      const runResult = await this.startApifyRun(runInput, googleSearchActor);

      // Step 2: Wait for the run to complete
      const completedRun = await this.waitForRunCompletion(
        runResult.id,
        300000,
        googleSearchActor,
      );

      if (completedRun.status !== 'SUCCEEDED') {
        throw new Error(
          `Apify Google Search run failed with status: ${
            completedRun.status
          }. ${completedRun.errorMessage || ''}`,
        );
      }

      // Step 3: Get the results
      const results = await this.getRunResults(completedRun.defaultDatasetId);

      console.log(
        `✅ Apify Google Search returned ${results.length} results for query: "${query}"`,
      );

      // Convert Google Search results to our expected format
      return this.convertGoogleSearchResultsToApifyFormat(results, query);
    } catch (error) {
      console.error('Apify Google Search failed:', error);
      throw AIServiceErrorFactory.createReviewCollectionError(
        'APIFY_API_ERROR',
        `Apify Google Search failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        'apify',
        [query],
      );
    }
  }

  private async startApifyRun(
    input: ApifyRunInput,
    actorId?: string,
  ): Promise<ApifyRunResult> {
    // Validate API token
    if (!this.config.apiToken) {
      throw new Error(
        'Apify API token not configured. Please set VITE_APIFY_API_TOKEN environment variable.',
      );
    }

    const actor = actorId || this.config.actorId;
    console.log(`🚀 Starting Apify run for actor: ${actor}`);
    console.log(
      `🔑 API Token configured: ${this.config.apiToken ? 'Yes' : 'No'}`,
    );
    console.log(`📝 Input:`, JSON.stringify(input, null, 2));

    // Determine the correct API endpoint based on actor ID
    const endpoint = `${this.config.baseUrl}/acts/${actor}/runs?token=${this.config.apiToken}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Apify API error: ${response.status} ${response.statusText}`,
      );
      console.error(`Error details:`, errorText);
      throw new Error(
        `Failed to start Apify run: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    const result = await response.json();
    console.log(`✅ Apify run started successfully:`, result);
    console.log(`📋 Response structure:`, {
      hasData: !!result.data,
      dataType: typeof result.data,
      hasId: !!result.id,
      hasDataId: !!(result.data && result.data.id),
      keys: Object.keys(result),
      dataKeys: result.data ? Object.keys(result.data) : null,
    });

    // Handle different response structures
    let runData = result;

    // Check if the response has a data property (common in Apify API responses)
    if (result.data && typeof result.data === 'object') {
      runData = result.data;
      console.log(`📦 Using data property for run information`);
    } else {
      console.log(`📦 Using direct response for run information`);
    }

    // Validate the response structure
    if (!runData.id) {
      console.error(`❌ Invalid Apify response - missing run ID:`, result);
      console.error(`Parsed run data:`, runData);
      throw new Error('Invalid Apify response: missing run ID');
    }

    return runData;
  }

  private async waitForRunCompletion(
    runId: string,
    maxWaitTime: number = 300000, // 5 minutes
    actorId?: string,
  ): Promise<ApifyRunResult> {
    console.log(`⏳ Waiting for Apify run completion: ${runId}`);
    const startTime = Date.now();
    const actor = actorId || this.config.actorId;

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await fetch(
          `${this.config.baseUrl}/acts/${actor}/runs/${runId}?token=${this.config.apiToken}`,
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `❌ Failed to check run status: ${response.status} ${response.statusText}`,
          );
          console.error(`Error details:`, errorText);
          throw new Error(
            `Failed to check run status: ${response.status} ${response.statusText}. ${errorText}`,
          );
        }

        const result = await response.json();

        // Handle different response structures
        let runInfo: ApifyRunResult = result;

        // Check if the response has a data property (common in Apify API responses)
        if (result.data && typeof result.data === 'object') {
          runInfo = result.data;
        }

        console.log(`📊 Run status: ${runInfo.status} (${runId})`);
        console.log(
          `📊 Dataset ID: ${runInfo.defaultDatasetId || 'undefined'}`,
        );

        if (
          runInfo.status === 'SUCCEEDED' ||
          runInfo.status === 'FAILED' ||
          runInfo.status === 'ABORTED' ||
          runInfo.status === 'TIMED-OUT'
        ) {
          console.log(`✅ Run completed with status: ${runInfo.status}`);
          if (runInfo.status === 'FAILED' && runInfo.errorMessage) {
            console.error(
              `❌ Apify run failed with error: ${runInfo.errorMessage}`,
            );
          }
          return runInfo;
        }

        // Wait 5 seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`❌ Error checking run status:`, error);
        throw error;
      }
    }

    throw new Error('Apify run timed out');
  }

  private async getRunResults(datasetId: string): Promise<any[]> {
    console.log(`📥 Fetching results from dataset: ${datasetId}`);

    const response = await fetch(
      `${this.config.baseUrl}/datasets/${datasetId}/items?token=${this.config.apiToken}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Failed to get run results: ${response.status} ${response.statusText}`,
      );
      console.error(`Error details:`, errorText);
      throw new Error(
        `Failed to get run results: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    const results = await response.json();
    console.log(`📊 Retrieved ${results.length} items from dataset`);

    return results;
  }

  private convertGoogleSearchResultsToApifyFormat(
    apifyResults: any[],
    businessName: string,
  ): ApifyApiResponse {
    // Google Search Results Scraper returns an array with one object containing organicResults
    const searchResult = apifyResults[0];
    if (!searchResult || !searchResult.organicResults) {
      console.warn('No organic results found in Google Search response');
      return {
        organic_results: [],
        reviews: [],
        search_metadata: {
          query: businessName,
          total_results: 0,
        },
      };
    }

    // Extract organic search results
    const organicResults: ApifySearchResult[] = searchResult.organicResults
      .filter((result: any) => result.title && result.url)
      .map((result: any, index: number) => ({
        title: result.title || '',
        link: result.url || '',
        snippet: result.description || '',
        position: result.position || index + 1,
        source: 'Google Search',
      }));

    // Extract reviews from organic results that contain review content
    const reviews: ApifyReviewResult[] = searchResult.organicResults
      .filter((result: any) => {
        const description = (result.description || '').toLowerCase();
        const title = (result.title || '').toLowerCase();
        return (
          description.includes('review') ||
          description.includes('rating') ||
          description.includes('stars') ||
          description.includes('customer') ||
          description.includes('experience') ||
          title.includes('review') ||
          title.includes('rating')
        );
      })
      .map((result: any, index: number) => ({
        text: result.description || result.title || '',
        rating: result.rating || result.stars || result.score,
        date: result.date || result.reviewDate || result.timestamp,
        source: result.url || 'Google Search',
        platform: this.detectPlatform(result.url || ''),
      }));

    // Also extract AI overview if available
    let aiOverview = null;
    if (searchResult.aiOverview && searchResult.aiOverview.content) {
      aiOverview = {
        question: `What are the reviews for ${businessName}?`,
        answer: searchResult.aiOverview.content,
      };
    }

    return {
      organic_results: organicResults,
      reviews: reviews,
      people_also_ask: aiOverview ? [aiOverview] : [],
      search_metadata: {
        query: businessName,
        total_results: organicResults.length + reviews.length,
      },
    };
  }

  private convertGoogleMapsResultsToApifyFormat(
    apifyResults: any[],
    businessName: string,
  ): ApifyApiResponse {
    console.log(
      '🔍 Converting Google Maps results:',
      apifyResults.length,
      'items',
    );

    // Google Maps Reviews Scraper returns reviews in a specific format
    const reviews: ApifyReviewResult[] = [];
    const organicResults: ApifySearchResult[] = [];

    for (const result of apifyResults) {
      console.log('📊 Processing result:', {
        hasReviews: !!result.reviews,
        hasBusinessInfo: !!result.businessInfo,
        hasPlaceId: !!result.placeId,
        resultKeys: Object.keys(result),
      });

      // Debug: Log the actual result structure
      console.log('🔍 Raw result data:', JSON.stringify(result, null, 2));

      // Extract reviews from the result
      if (result.reviews && Array.isArray(result.reviews)) {
        for (const review of result.reviews) {
          if (review.text || review.reviewText || review.comment) {
            reviews.push({
              text: review.text || review.reviewText || review.comment || '',
              rating:
                review.rating ||
                review.stars ||
                review.score ||
                review.ratingValue,
              date:
                review.date ||
                review.reviewDate ||
                review.timestamp ||
                review.publishedAtDate,
              source: review.source || result.url || 'Google Maps',
              platform: 'Google Maps',
            });
          }
        }
      }

      // Extract business information
      if (result.businessInfo) {
        organicResults.push({
          title: result.businessInfo.name || businessName,
          link: result.url || result.placeUrl || '',
          snippet:
            result.businessInfo.description ||
            result.businessInfo.summary ||
            '',
          position: 1,
          source: 'Google Maps',
        });
      }

      // Handle direct review objects (if the scraper returns them directly)
      if (result.reviewText || result.text || result.comment) {
        reviews.push({
          text: result.reviewText || result.text || result.comment || '',
          rating:
            result.rating || result.stars || result.score || result.ratingValue,
          date:
            result.date ||
            result.reviewDate ||
            result.timestamp ||
            result.publishedAtDate,
          source: result.source || result.url || 'Google Maps',
          platform: 'Google Maps',
        });
      }
    }

    console.log(
      `✅ Converted ${reviews.length} reviews and ${organicResults.length} business info items`,
    );

    return {
      organic_results: organicResults,
      reviews: reviews,
      search_metadata: {
        query: businessName,
        total_results: organicResults.length + reviews.length,
      },
    };
  }

  private convertApifyResultsToApifyFormat(
    apifyResults: any[],
    query: string,
  ): ApifyApiResponse {
    const organicResults: ApifySearchResult[] = apifyResults
      .filter((result) => result.title && result.link)
      .map((result, _index) => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || result.description || '',
        position: _index + 1,
        source: result.source || 'Apify',
      }));

    return {
      organic_results: organicResults,
      search_metadata: {
        query,
        total_results: organicResults.length,
      },
    };
  }

  private extractReviewsFromResults(
    results: ApifyApiResponse,
    companyName: string,
  ): ApifyReviewResult[] {
    const reviews: ApifyReviewResult[] = [];

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

    // Skip company website content and market research
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
      'customer experience (cx)',
      'cx trends',
      'customer service trends',
      'emerging trends',
      'transformative trends',
      'ai-driven personalization',
      'sentiment analytics',
      'support leaders',
      'generative ai',
      'customer interactions',
      'seamless',
      'harbingers',
      'future',
      'predictions',
      'q4 2024',
      'retail & consumer',
      'third-party relationships',
      'high-quality customer experience',
      'fostering',
      'empowering',
      'personalized and efficient',
      'harnessing',
      'sales growth',
      'markkinatutkimus',
      'alan trendit',
      'asiakaskokemus',
      'trendit',
    ];

    if (skipPhrases.some((phrase) => lowerSnippet.includes(phrase))) {
      return false;
    }

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

    // Much less strict filtering - just need to mention the company and have some review-like content
    return (
      hasReviewIndicators ||
      lowerSnippet.includes('review') ||
      lowerSnippet.includes('rating') ||
      lowerSnippet.includes('stars')
    );
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

  private deduplicateReviews(
    reviews: ApifyReviewResult[],
  ): ApifyReviewResult[] {
    const seen = new Set<string>();
    const unique: ApifyReviewResult[] = [];

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

  /**
   * Get API configuration status
   */
  getApiConfig(): {
    hasApiToken: boolean;
    actorId: string;
    isConfigured: boolean;
  } {
    return {
      hasApiToken: Boolean(this.config.apiToken),
      actorId: this.config.actorId,
      isConfigured: Boolean(this.config.apiToken),
    };
  }

  /**
   * Test Apify connectivity
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: {
      actorId: string;
      hasApiToken: boolean;
    };
  }> {
    try {
      if (!this.config.apiToken) {
        return {
          success: false,
          message: 'Apify API token not configured',
          details: {
            actorId: this.config.actorId,
            hasApiToken: false,
          },
        };
      }

      // Test with a simple search
      const testResult = await this.searchCompanyReviews("McDonald's", {
        location: 'United States',
        maxResults: 1,
        country: 'United States',
      });

      return {
        success: true,
        message: `Apify test successful. Found ${testResult.length} test results.`,
        details: {
          actorId: this.config.actorId,
          hasApiToken: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Apify test failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        details: {
          actorId: this.config.actorId,
          hasApiToken: Boolean(this.config.apiToken),
        },
      };
    }
  }
}
