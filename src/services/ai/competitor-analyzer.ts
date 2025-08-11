import type { CompetitorData, CompetitorAnalysis } from './types';
import { OllamaClient } from './ollama-client';

export class CompetitorAnalyzer {
  private ollamaClient: OllamaClient;

  constructor() {
    this.ollamaClient = OllamaClient.getInstance();
  }

  async generateCompetitorAnalysis(
    competitor: CompetitorData,
    websiteContent: string,
  ): Promise<CompetitorAnalysis> {
    try {
      const prompt = this.buildCompetitorAnalysisPrompt(
        competitor,
        websiteContent,
      );
      const responseText = await this.ollamaClient.generateResponse(prompt);

      return this.parseCompetitorAnalysisResponse(responseText);
    } catch (error) {
      console.error('Competitor analysis error:', error);
      throw error;
    }
  }

  private buildCompetitorAnalysisPrompt(
    competitor: CompetitorData,
    websiteContent: string,
  ): string {
    return `Analyze the competitor's website content and produce a comprehensive analysis:

 Competitor: ${competitor.name}
 Website: ${competitor.website}
 Social: ${competitor.social}

 Website content:
 ${websiteContent.substring(0, 2000)}

 Respond in JSON only with the following fields:
 - targetAudience
 - painPoints
 - valueProposition
 - pricingStrategy
 - marketingChannels
 - strengths
 - weaknesses
 - opportunities
 - threats

 Return JSON only without additional text.`;
  }

  private parseCompetitorAnalysisResponse(
    responseText: string,
  ): CompetitorAnalysis {
    try {
      const analysis = JSON.parse(responseText);
      return analysis;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse competitor analysis from AI response');
    }
  }
}
