import type { ICP, CustomerReview } from './types';
import { ICPGenerator } from './icp-generator';
import { ReviewAnalyzer } from './review-analyzer';
import { WebsiteScraper } from './website-scraper';

export class AIService {
  private icpGenerator: ICPGenerator;
  private reviewAnalyzer: ReviewAnalyzer;
  private websiteScraper: WebsiteScraper;

  constructor() {
    this.icpGenerator = new ICPGenerator();
    this.reviewAnalyzer = new ReviewAnalyzer();
    this.websiteScraper = new WebsiteScraper();
  }

  // Fetch website content
  async scrapeWebsite(url: string): Promise<string> {
    return this.websiteScraper.scrapeWebsite(url);
  }

  // Analyze customer reviews
  async analyzeReviews(reviews: CustomerReview[]): Promise<string> {
    const analysis = ReviewAnalyzer.analyzeBatch(reviews);
    return JSON.stringify(analysis, null, 2);
  }

  // Generate ICP profiles
  async generateICPs(reviews: CustomerReview[] = []): Promise<ICP[]> {
    return this.icpGenerator.generateICPs(reviews);
  }

  // Competitor analysis removed
}
