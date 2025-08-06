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

  // Hae sivuston sisältö
  async scrapeWebsite(url: string): Promise<string> {
    return this.websiteScraper.scrapeWebsite(url);
  }

  // Analysoi asiakasarvostelut
  async analyzeReviews(reviews: CustomerReview[]): Promise<string> {
    return this.reviewAnalyzer.analyzeReviews(reviews);
  }

  // Luo ICP-profiileja
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

  // Luo kilpailija-analyysi
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
