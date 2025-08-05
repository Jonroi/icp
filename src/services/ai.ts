import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ICP {
  name: string;
  description: string;
  demographics: {
    age: string;
    gender: string;
    location: string;
    income: string;
    education: string;
  };
  psychographics: {
    interests: string[];
    values: string[];
    lifestyle: string;
    painPoints: string[];
  };
  behavior: {
    onlineHabits: string[];
    purchasingBehavior: string;
    brandPreferences: string[];
  };
  goals: string[];
  challenges: string[];
  preferredChannels: string[];
}

export interface CompetitorData {
  name: string;
  website: string;
  social: string;
}

export interface CompetitorAnalysis {
  targetAudience: string[];
  painPoints: string[];
  valueProposition: string;
  pricingStrategy: string;
  marketingChannels: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CustomerReview {
  text: string;
  source: string;
}

export class AIService {
  private useLocalLLM: boolean;
  private ollamaUrl: string;

  constructor(apiKey?: string) {
    this.useLocalLLM = !apiKey;
    this.ollamaUrl = 'http://localhost:11434/api/generate';
  }

  // Hae sivuston sisältö
  async scrapeWebsite(url: string): Promise<string> {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Poista skriptit, tyylit ja muut ei-tekstisisältö
      $('script').remove();
      $('style').remove();
      $('nav').remove();
      $('footer').remove();

      return $('body').text().trim();
    } catch (error) {
      console.error('Error scraping website:', error);
      return '';
    }
  }

  // Analysoi asiakasarvostelut
  async analyzeReviews(reviews: CustomerReview[]): Promise<string> {
    if (reviews.length === 0) return 'No reviews to analyze';

    const reviewTexts = reviews.map((r) => r.text).join('\n');

    if (this.useLocalLLM) {
      return this.analyzeWithOllama(reviewTexts);
    } else {
      throw new Error(
        'No AI service available. Please provide an API key or set up Ollama.',
      );
    }
  }

  // Analysoi Ollama-mallilla
  private async analyzeWithOllama(text: string): Promise<string> {
    try {
      const prompt = `Analysoi seuraavat asiakasarvostelut ja kerro yleisimmät teemat, positiiviset ja negatiiviset asiat:

${text}

Anna vastaus suomeksi ja ole ytimekäs.`;

      const response = await axios.post(this.ollamaUrl, {
        model: 'llama2:7b',
        prompt: prompt,
        stream: false,
      });

      return response.data.response || 'Analyysi epäonnistui';
    } catch (error) {
      console.error('Ollama error:', error);
      return 'Paikallinen LLM ei ole saatavilla. Asenna Ollama: https://ollama.ai ja lataa malli: ollama pull llama2:7b';
    }
  }

  // Luo ICP-profiileja
  async generateICPs(
    competitors: CompetitorData[],
    reviews: CustomerReview[],
    additionalContext: string = '',
  ): Promise<ICP[]> {
    if (this.useLocalLLM) {
      return this.generateICPsWithOllama(
        competitors,
        reviews,
        additionalContext,
      );
    } else {
      throw new Error(
        'No AI service available. Please provide an API key or set up Ollama.',
      );
    }
  }

  // Luo ICP:t Ollama-mallilla
  private async generateICPsWithOllama(
    competitors: CompetitorData[],
    reviews: CustomerReview[],
    additionalContext: string,
  ): Promise<ICP[]> {
    try {
      const competitorInfo = competitors
        .map((c) => `${c.name} (${c.website})`)
        .join('\n');
      const reviewTexts = reviews.map((r) => r.text).join('\n');

      const prompt = `Luo 3 Ideal Customer Profile (ICP) -profiilia seuraavien tietojen perusteella:

Kilpailijat:
${competitorInfo}

Asiakasarvostelut:
${reviewTexts}

Lisätiedot:
${additionalContext}

Vastaa JSON-muodossa suomeksi. Jokainen ICP sisältää:
- name: profiilin nimi
- description: kuvaus
- demographics: ikä, sukupuoli, sijainti, tulot, koulutus
- psychographics: kiinnostukset, arvot, elämäntapa, ongelmat
- behavior: online-tottumukset, ostokäyttäytyminen, brändimieltymykset
- goals: tavoitteet
- challenges: haasteet
- preferredChannels: suositut kanavat

Vastaa vain JSON-muodossa ilman ylimääräisiä tekstejä.`;

      const response = await axios.post(this.ollamaUrl, {
        model: 'llama2:7b',
        prompt: prompt,
        stream: false,
      });

      const responseText = response.data.response;

      try {
        // Yritä parsia JSON-vastaus
        const icps = JSON.parse(responseText);
        return Array.isArray(icps) ? icps : [icps];
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse ICP data from AI response');
      }
    } catch (error) {
      console.error('Ollama ICP generation error:', error);
      throw error;
    }
  }

  // Luo kilpailija-analyysi
  async generateCompetitorAnalysis(
    competitor: CompetitorData,
    websiteContent: string,
  ): Promise<CompetitorAnalysis> {
    if (this.useLocalLLM) {
      return this.generateCompetitorAnalysisWithOllama(
        competitor,
        websiteContent,
      );
    } else {
      throw new Error(
        'No AI service available. Please provide an API key or set up Ollama.',
      );
    }
  }

  // Luo kilpailija-analyysi Ollama-mallilla
  private async generateCompetitorAnalysisWithOllama(
    competitor: CompetitorData,
    websiteContent: string,
  ): Promise<CompetitorAnalysis> {
    try {
      const prompt = `Analysoi seuraavan kilpailijan sivuston sisältö ja luo kattava analyysi:

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

      const response = await axios.post(this.ollamaUrl, {
        model: 'llama2:7b',
        prompt: prompt,
        stream: false,
      });

      const responseText = response.data.response;

      try {
        const analysis = JSON.parse(responseText);
        return analysis;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse competitor analysis from AI response');
      }
    } catch (error) {
      console.error('Ollama competitor analysis error:', error);
      throw error;
    }
  }
}
