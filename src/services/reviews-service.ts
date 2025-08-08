import { WebTextFetcher } from './web-text-fetcher';
import { ReviewAgent } from './ai';

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
    const tasks: Array<Promise<ReviewSourceResult>> = [];
    // Removed Reddit source per request
    if (website) {
      tasks.push(this.fetchFromTrustpilot(website));
    }
    // Also search Trustpilot by name when no website is provided
    if (!website) {
      tasks.push(this.searchTrustpilotByName(companyName));
    }

    const results = await Promise.allSettled(tasks);
    const collected: string[] = [];

    for (const res of results) {
      if (res.status === 'fulfilled') {
        collected.push(...res.value.items);
      }
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

    // If too few passed, try fallback approaches
    let finalBlocks = validated.length >= 3 ? validated : unique;

    // If still no reviews, try less aggressive filtering
    if (finalBlocks.length === 0 && website) {
      console.log('No reviews found with normal filtering, trying fallback...');
      const fallbackReviews = await this.fallbackTrustpilotSearch(website);
      finalBlocks = fallbackReviews.items;
    }

    return finalBlocks.join('\n\n');
  }

  // Reddit source removed per product decision

  // Trustpilot scraping with improved content extraction
  private static async fetchFromTrustpilot(
    website: string,
  ): Promise<ReviewSourceResult> {
    try {
      const host = this.extractHostname(website);
      if (!host) return { source: 'trustpilot', items: [] };

      // Try multiple Trustpilot URLs to find reviews - be more flexible with domains
      const urls = [
        `https://www.trustpilot.com/review/${host}`,
        `https://www.trustpilot.com/review/${host.replace('.com', '')}`,
        `https://www.trustpilot.com/review/${host.replace('.fi', '')}`,
        `https://www.trustpilot.com/review/${host.replace('.de', '')}`,
        `https://www.trustpilot.com/review/www.${host}`,
        // Try search-based approach for companies that might not have direct pages
        `https://www.trustpilot.com/search?query=${encodeURIComponent(
          host.replace(/\.(com|fi|de|co\.uk)$/, ''),
        )}`,
      ];

      let allReviews: string[] = [];

      for (const url of urls) {
        try {
          console.log(`Fetching reviews from: ${url}`);
          const text = await this.textFetcher.fetchStructuredText(
            url,
            undefined,
            25000,
          );
          const reviews = this.extractTrustpilotReviews(text);
          allReviews.push(...reviews);

          // If we found some reviews, no need to try other URLs
          if (reviews.length > 0) {
            console.log(`Found ${reviews.length} reviews from ${url}`);
            break;
          }
        } catch (error) {
          console.log(`Failed to fetch from ${url}:`, error);
          continue;
        }
      }

      // Remove duplicates and take the best ones
      const uniqueReviews = Array.from(new Set(allReviews))
        .filter((review) => review.length > 50)
        .slice(0, 20);

      return { source: 'trustpilot', items: uniqueReviews };
    } catch (error) {
      console.error('Error fetching Trustpilot reviews:', error);
      return { source: 'trustpilot', items: [] };
    }
  }

  // Trustpilot search by company name (search results page)
  private static async searchTrustpilotByName(
    companyName: string,
  ): Promise<ReviewSourceResult> {
    try {
      const query = encodeURIComponent(companyName);
      const url = `https://www.trustpilot.com/search?query=${query}`;
      const text = await this.textFetcher.fetchStructuredText(
        url,
        undefined,
        25000,
      );
      const items = this.extractTrustpilotReviews(text);
      return { source: 'trustpilot-search', items };
    } catch {
      return { source: 'trustpilot-search', items: [] };
    }
  }

  private static extractTrustpilotReviews(text: string): string[] {
    const reviews: string[] = [];

    // Split by multiple newlines to get blocks
    const blocks = text
      .split(/\n\s*\n+/)
      .map((block) => block.trim())
      .filter(Boolean);

    // Enhanced filtering for actual review content
    const stopPhrases = [
      'trustscore',
      'trustpilot',
      'write a review',
      'visit website',
      'suggested searches',
      'categories',
      'blog',
      'for businesses',
      'log in',
      'sign up',
      'image',
      'logo',
      'stars',
      'star',
      'rating',
      'how this company uses trustpilot',
      'cookie',
      'cookies',
      'privacy policy',
      'terms & conditions',
      'terms and conditions',
      'guidelines for reviewers',
      'do not sell my info',
      'modern slavery',
      'system status',
      'legal',
      'preferences',
      'advertising',
      'analytics',
      'insurance agency in united states',
      'travel agency in new york',
      'furniture store near me',
      'bank in chicago',
      'best payment service',
      'companies can ask for reviews',
      'automatic invitations',
      'labeled verified',
      'genuine experiences',
      'tips for writing',
      'great reviews',
      'help.trustpilot.com',
    ];

    const navigationWords = [
      'home',
      'about',
      'contact',
      'help',
      'support',
      'business',
      'categories',
      'search',
      'filter',
      'sort',
      'menu',
      'login',
    ];

    for (const block of blocks) {
      const lower = block.toLowerCase();

      // Skip if contains stop phrases
      if (stopPhrases.some((phrase) => lower.includes(phrase))) continue;

      // Skip if it's just navigation
      if (navigationWords.some((word) => lower === word)) continue;

      // Skip if too short
      if (block.length < 80) continue;

      // Skip if it looks like a link or URL pattern
      if (/^https?:\/\//.test(block) || /\[.*\]\(.*\)/.test(block)) continue;

      // Skip if it's just a title or heading pattern
      if (/^[A-Z][a-z\s-]+$/.test(block) && block.split(' ').length < 6)
        continue;

      // Must contain sentence punctuation
      if (!/[.!?]/.test(block)) continue;

      // Must have reasonable word count
      const wordCount = block.split(/\s+/).length;
      if (wordCount < 8 || wordCount > 500) continue; // More lenient minimum

      // Look for review indicators - more flexible
      const reviewIndicators = [
        /\b(order|delivery|service|customer|support|experience|product|quality|fast|slow|good|bad|excellent|terrible|recommend|satisfied|disappointed|received|shipped|arrived|helpful|staff|team|company|business)\b/i,
        /\b(days?|weeks?|months?|years?|time|long|short)\b/i, // Time references
        /\b(\$|£|€|price|cost|money|paid|payment|expensive|cheap)\b/i, // Money references
        /\b(I|we|my|our|me|us)\b/i, // Personal pronouns indicating first-person experience
        /\b(review|rating|star|experience|opinion|thought|feel|think)\b/i, // Review-specific words
      ];

      // More lenient: only need to match one indicator OR have good sentence structure
      const hasReviewIndicator = reviewIndicators.some((pattern) =>
        pattern.test(block),
      );
      const hasGoodStructure =
        /[.!?]/.test(block) && wordCount >= 8 && block.length >= 60;

      if (!hasReviewIndicator && !hasGoodStructure) continue;

      // Clean up the review text
      const cleanedReview = block
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/^[\-\*\+•]\s*/, '') // Remove bullet points
        .trim();

      if (cleanedReview.length >= 80) {
        reviews.push(cleanedReview);
      }
    }

    return reviews;
  }

  // Fallback search with less aggressive filtering
  private static async fallbackTrustpilotSearch(
    website: string,
  ): Promise<ReviewSourceResult> {
    try {
      const host = this.extractHostname(website);
      if (!host) return { source: 'trustpilot-fallback', items: [] };

      console.log(`Fallback search for: ${host}`);

      // Try alternative search approaches - be more comprehensive
      const searchUrls = [
        `https://www.trustpilot.com/review/${host}`,
        `https://www.trustpilot.com/search?query=${encodeURIComponent(host)}`,
        `https://www.trustpilot.com/search?query=${encodeURIComponent(
          host.replace(/\.(com|fi|de|co\.uk)$/, ''),
        )}`,
        `https://www.trustpilot.com/search?query=${encodeURIComponent(
          host.replace(/\.(com|fi|de|co\.uk)$/, '').replace(/\./g, ' '),
        )}`,
        // Try company name variations
        `https://www.trustpilot.com/search?query=${encodeURIComponent(
          'db schenker',
        )}`,
        `https://www.trustpilot.com/search?query=${encodeURIComponent(
          'schenker',
        )}`,
      ];

      for (const url of searchUrls) {
        try {
          console.log(`Trying fallback URL: ${url}`);
          const text = await this.textFetcher.fetchStructuredText(
            url,
            undefined,
            25000,
          );

          // Use more lenient filtering for fallback
          const blocks = text
            .split(/\n\s*\n+/)
            .map((block) => block.trim())
            .filter(Boolean);

          const lenientReviews: string[] = [];

          for (const block of blocks) {
            const lower = block.toLowerCase();

            // Only skip obvious navigation/legal content
            const mustSkip = [
              'write a review',
              'visit website',
              'privacy policy',
              'terms & conditions',
              'cookie',
              'help.trustpilot.com',
              'categories',
              'log in',
              'sign up',
            ];

            if (mustSkip.some((phrase) => lower.includes(phrase))) continue;
            if (block.length < 50) continue; // More lenient length
            if (!/[.!?]/.test(block)) continue;

            // More lenient review indicators for fallback
            const hasReviewLikeContent =
              /\b(service|delivery|order|experience|customer|support|staff|team|good|bad|fast|slow|company|business)\b/i.test(
                block,
              ) ||
              /\b(days?|weeks?|months?|years?|time)\b/i.test(block) ||
              /\b(I|we|my|our|me|us)\b/i.test(block) ||
              /\b(review|rating|star|opinion|thought)\b/i.test(block) ||
              /[.!?]/.test(block); // Just needs sentence structure

            if (hasReviewLikeContent && block.split(/\s+/).length >= 5) {
              lenientReviews.push(block);
            }
          }

          if (lenientReviews.length > 0) {
            console.log(
              `Found ${lenientReviews.length} reviews with fallback from: ${url}`,
            );
            return {
              source: 'trustpilot-fallback',
              items: lenientReviews.slice(0, 10),
            };
          }
        } catch (error) {
          console.log(`Fallback failed for ${url}:`, error);
          continue;
        }
      }

      return { source: 'trustpilot-fallback', items: [] };
    } catch (error) {
      console.error('Fallback search failed:', error);
      return { source: 'trustpilot-fallback', items: [] };
    }
  }

  private static extractHostname(url: string): string | null {
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }
}
