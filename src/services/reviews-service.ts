import { SerpReviewsService } from './serp-reviews-service';
import { AIServiceErrorFactory, InputValidator } from './ai/error-types';

export class ReviewsService {
  // Public API used by UI - Now uses only SERP API
  static async fetchCustomerReviews(
    companyName: string,
    website?: string,
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

    // Use SERP API for all review fetching
    return SerpReviewsService.fetchCustomerReviews(companyName, {
      website,
      location: 'Finland',
      maxResults: 20,
      includeMarketData: true,
    });
  }

  /**
   * Get SERP API configuration status
   */
  static getApiConfig() {
    return SerpReviewsService.getApiConfig();
  }

  /**
   * Test SERP API connectivity
   */
  static async testConnection() {
    return SerpReviewsService.testConnection();
  }
}
