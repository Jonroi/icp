import type { CustomerReview } from './types';
import { OllamaClient } from './ollama-client';

export class ReviewAnalyzer {
  private ollamaClient: OllamaClient;

  constructor() {
    this.ollamaClient = new OllamaClient();
  }

  async analyzeReviews(reviews: CustomerReview[]): Promise<string> {
    if (reviews.length === 0) return 'No reviews to analyze';

    const reviewTexts = reviews.map((r) => r.text).join('\n');
    return this.ollamaClient.analyzeReviews(reviewTexts);
  }
}
