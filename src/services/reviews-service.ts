import { WebTextFetcher } from './web-text-fetcher';
import { ReviewAgent } from './ai';
import {
  AIServiceErrorFactory,
  InputValidator,
  type ReviewCollectionError,
} from './ai/error-types';

interface ReviewSourceResult {
  source: string;
  items: string[];
}

export class ReviewsService {
  private static textFetcher = new WebTextFetcher();

  // Public API used by UI
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

    const tasks: Array<Promise<ReviewSourceResult>> = [];
    const attemptedUrls: string[] = [];

    if (website) {
      tasks.push(this.fetchFromTrustpilot(website));
      attemptedUrls.push(website);
    } else {
      tasks.push(this.searchTrustpilotByName(companyName));
    }

    if (tasks.length === 0) {
      throw AIServiceErrorFactory.createReviewCollectionError(
        'NO_REVIEWS_FOUND',
        'No valid sources available for review collection',
        'none',
        attemptedUrls,
      );
    }

    const results = await Promise.allSettled(tasks);
    const collected: string[] = [];
    const errors: string[] = [];

    for (const res of results) {
      if (res.status === 'fulfilled') {
        collected.push(...res.value.items);
      } else {
        errors.push(res.reason?.message || 'Unknown error');
      }
    }

    if (collected.length === 0) {
      throw AIServiceErrorFactory.createReviewCollectionError(
        'NO_REVIEWS_FOUND',
        `Failed to collect reviews from all sources. Errors: ${errors.join(
          '; ',
        )}`,
        website ? 'trustpilot' : 'trustpilot-search',
        attemptedUrls,
      );
    }

    const unique = Array.from(new Set(collected.map((t) => t.trim()))).filter(
      Boolean,
    );

    // Validate with LLM agent to ensure they look like real reviews
    const agent = new ReviewAgent();
    const validations = await agent.validateReviewBlocks(unique);
    const validated = unique.filter(
      (_, i) => validations[i]?.isValid !== false,
    );

    // Use validated reviews if we have enough, otherwise use all unique reviews
    const finalBlocks = validated.length >= 3 ? validated : unique;

    if (finalBlocks.length === 0) {
      throw AIServiceErrorFactory.createReviewCollectionError(
        'VALIDATION_FAILED',
        'All collected text blocks failed validation as customer reviews',
        website ? 'trustpilot' : 'trustpilot-search',
        attemptedUrls,
      );
    }

    console.log(
      `✅ Successfully collected ${finalBlocks.length} reviews (${validated.length} validated)`,
    );
    return finalBlocks.join('\n\n');
  }

  private static async fetchFromTrustpilot(
    website: string,
  ): Promise<ReviewSourceResult> {
    try {
      const host = this.extractHostname(website);
      if (!host) {
        throw new Error(`Invalid website URL: ${website}`);
      }

      console.log(`🔍 Fetching Trustpilot reviews for: ${host}`);

      const searchUrls = [
        `https://www.trustpilot.com/review/${host}`,
        `https://www.trustpilot.com/search?query=${encodeURIComponent(host)}`,
      ];

      for (const url of searchUrls) {
        try {
          console.log(`Trying URL: ${url}`);
          const text = await this.textFetcher.fetchStructuredText(
            url,
            undefined,
            30000,
          );

          if (!text || text.length < 100) {
            console.log(`URL returned insufficient content: ${url}`);
            continue;
          }

          const reviews = this.extractTrustpilotReviews(text);
          if (reviews.length > 0) {
            console.log(`Found ${reviews.length} reviews from: ${url}`);
            return { source: 'trustpilot', items: reviews };
          }
        } catch (error) {
          console.log(`Failed to fetch from ${url}:`, error);
          continue;
        }
      }

      throw new Error(`No reviews found for ${host} on Trustpilot`);
    } catch (error) {
      console.error('Trustpilot fetch failed:', error);
      throw error;
    }
  }

  private static async searchTrustpilotByName(
    companyName: string,
  ): Promise<ReviewSourceResult> {
    try {
      console.log(`🔍 Searching Trustpilot by name: ${companyName}`);
      const query = encodeURIComponent(companyName);
      const searchUrl = `https://www.trustpilot.com/search?query=${query}`;

      const text = await this.textFetcher.fetchStructuredText(
        searchUrl,
        undefined,
        30000,
      );

      if (!text || text.length < 100) {
        throw new Error(
          `Search returned insufficient content for: ${companyName}`,
        );
      }

      const reviews = this.extractTrustpilotReviews(text);
      console.log(`Found ${reviews.length} reviews from search`);
      return { source: 'trustpilot-search', items: reviews };
    } catch (error) {
      console.error('Trustpilot search failed:', error);
      throw error;
    }
  }

  private static extractTrustpilotReviews(text: string): string[] {
    console.log(`🔍 Extracting reviews from ${text.length} chars of text`);

    const blocks = text
      .split(/\n\s*\n+/)
      .map((block) => block.trim())
      .filter(Boolean);

    const reviews: string[] = [];
    const seenReviews = new Set<string>();

    for (const block of blocks) {
      const lower = block.toLowerCase();

      // Skip navigation and UI elements
      const skipPhrases = [
        'write a review',
        'visit website',
        'privacy policy',
        'terms & conditions',
        'cookie',
        'help.trustpilot.com',
        'categories',
        'log in',
        'sign up',
        'view all',
        'read more',
        'show more',
        'load more',
        'follow us',
      ];

      if (skipPhrases.some((phrase) => lower.includes(phrase))) {
        continue;
      }

      // Must be substantial text with sentence structure
      if (block.length < 80 || !/[.!?]/.test(block)) continue;

      // Should have review-like characteristics
      const hasPersonalPronouns = /\b(i|we|my|our|me|us)\b/i.test(block);
      const hasExperienceWords =
        /\b(experience|service|delivery|order|customer|support|staff|team|product|quality|price|fast|slow|good|bad|excellent|terrible|recommend)\b/i.test(
          block,
        );

      if (!hasPersonalPronouns && !hasExperienceWords) continue;

      // Check for duplicates
      const reviewKey = block.substring(0, 50).toLowerCase();
      if (seenReviews.has(reviewKey)) continue;
      seenReviews.add(reviewKey);

      reviews.push(block);
      if (reviews.length >= 15) break;
    }

    console.log(`   ✅ Extracted ${reviews.length} potential reviews`);
    return reviews;
  }

  private static extractHostname(url: string): string | null {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
      return match ? match[1].toLowerCase() : null;
    }
  }
}
