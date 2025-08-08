import type {
  ICP,
  CompetitorData,
  CompetitorAnalysis,
  CustomerReview,
} from './types';
import { ICPGenerator } from './icp-generator';
import { CompetitorAnalyzer } from './competitor-analyzer';
import { ReviewAnalyzer } from './review-analyzer';
import { WebsiteScraper } from './website-scraper';

export class AIService {
  private icpGenerator: ICPGenerator;
  private competitorAnalyzer: CompetitorAnalyzer;
  private reviewAnalyzer: ReviewAnalyzer;
  private websiteScraper: WebsiteScraper;

  constructor() {
    this.icpGenerator = new ICPGenerator();
    this.competitorAnalyzer = new CompetitorAnalyzer();
    this.reviewAnalyzer = new ReviewAnalyzer();
    this.websiteScraper = new WebsiteScraper();
  }

  // Fetch website content
  async scrapeWebsite(url: string): Promise<string> {
    return this.websiteScraper.scrapeWebsite(url);
  }

  // Analyze customer reviews
  async analyzeReviews(reviews: CustomerReview[]): Promise<string> {
    return this.reviewAnalyzer.analyzeReviews(reviews);
  }

  // Generate ICP profiles
  async generateICPs(
    competitors: CompetitorData[],
    reviews: CustomerReview[],
    additionalContext: string = '',
  ): Promise<ICP[]> {
    return this.icpGenerator.generateICPs(
      competitors,
      reviews,
      additionalContext,
    );
  }

  // Generate competitor analysis
  async generateCompetitorAnalysis(
    competitor: CompetitorData,
    websiteContent: string,
  ): Promise<CompetitorAnalysis> {
    return this.competitorAnalyzer.generateCompetitorAnalysis(
      competitor,
      websiteContent,
    );
  }
}
