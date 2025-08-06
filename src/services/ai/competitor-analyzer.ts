import type { CompetitorData, CompetitorAnalysis } from './types';
import { OllamaClient } from './ollama-client';

export class CompetitorAnalyzer {
  private ollamaClient: OllamaClient;

  constructor() {
    this.ollamaClient = new OllamaClient();
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
    return `Analysoi seuraavan kilpailijan sivuston sisältö ja luo kattava analyysi:

Kilpailija: ${competitor.name}
Sivusto: ${competitor.website}
Sosiaalinen media: ${competitor.social}

Sivuston sisältö:
${websiteContent.substring(0, 2000)}

Luo analyysi JSON-muodossa suomeksi sisältäen:
- targetAudience: kohderyhmät
- painPoints: asiakkaiden ongelmat
- valueProposition: arvolupaus
- pricingStrategy: hinnoittelustrategia
- marketingChannels: markkinointikanavat
- strengths: vahvuudet
- weaknesses: heikkoudet
- opportunities: mahdollisuudet
- threats: uhat

Vastaa vain JSON-muodossa ilman ylimääräisiä tekstejä.`;
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
