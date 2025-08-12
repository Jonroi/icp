import { ApifyReviewsService } from './apify-reviews-service';
import { AIServiceErrorFactory, InputValidator } from './ai/error-types';

export class ReviewsService {
  // Public API used by UI - Now uses only Apify Google Maps API
  static async fetchCustomerReviews(
    companyName: string,
    website?: string,
    options?: {
      location?: string;
    },
  ): Promise<string> {
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

    if (website) {
      const websiteValidation = InputValidator.validateWebsiteUrl(website);
      if (!websiteValidation.isValid) {
        throw AIServiceErrorFactory.createReviewCollectionError(
          'INVALID_WEBSITE',
          `Invalid website URL: ${websiteValidation.errors
            .map((e) => e.message)
            .join(', ')}`,
          undefined,
          [website],
        );
      }
    }

    // Use Apify Google Maps API for all review fetching
    return ApifyReviewsService.fetchCustomerReviews(companyName, {
      website,
      location: options?.location || 'Global', // Use provided location or default to Global
      maxResults: 20, // Set to exactly 20 reviews for optimal cost control
      includeMarketData: true,
    });
  }

  /**
   * Get Apify API configuration status
   */
  static getApiConfig() {
    return ApifyReviewsService.getApiConfig();
  }

  /**
   * Test Apify API connectivity
   */
  static async testConnection() {
    return ApifyReviewsService.testConnection();
  }
}
