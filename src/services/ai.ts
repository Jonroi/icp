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
    this.useLocalLLM = !apiKey || apiKey === 'mock';
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
    if (reviews.length === 0) return '';

    const reviewTexts = reviews.map((r) => r.text).join('\n');

    if (this.useLocalLLM) {
      return this.analyzeWithOllama(reviewTexts);
    } else {
      return this.analyzeWithMock(reviewTexts);
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

  // Analysoi mock-datalla
  private async analyzeWithMock(text: string): Promise<string> {
    const positiveWords = [
      'hyvä',
      'erinomainen',
      'loistava',
      'suosittelen',
      'tyytyväinen',
    ];
    const negativeWords = ['huono', 'huonoa', 'pettymys', 'ongelma', 'virhe'];

    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter((word) =>
      textLower.includes(word),
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      textLower.includes(word),
    ).length;

    return `Mock-analyysi:
    
Positiivisia sanoja: ${positiveCount}
Negatiivisia sanoja: ${negativeCount}
Sentiment: ${
      positiveCount > negativeCount
        ? 'Positiivinen'
        : negativeCount > positiveCount
        ? 'Negatiivinen'
        : 'Neutraali'
    }

Alkuperäiset arvostelut:
${text}`;
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
      return this.generateMockICPs();
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
        return this.generateMockICPs();
      }
    } catch (error) {
      console.error('Ollama ICP generation error:', error);
      return this.generateMockICPs();
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
      return this.generateMockCompetitorAnalysis();
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
        return this.generateMockCompetitorAnalysis();
      }
    } catch (error) {
      console.error('Ollama competitor analysis error:', error);
      return this.generateMockCompetitorAnalysis();
    }
  }

  // Luo mock kilpailija-analyysi
  private generateMockCompetitorAnalysis(): CompetitorAnalysis {
    return {
      targetAudience: [
        'Tech-savvy professionals aged 25-40',
        'Small to medium businesses',
        'Marketing managers and directors',
      ],
      painPoints: [
        'Limited budget for marketing tools',
        'Time constraints in campaign management',
        'Difficulty measuring ROI',
      ],
      valueProposition:
        'AI-powered marketing automation that saves time and increases conversions',
      pricingStrategy: 'Freemium model with premium tiers',
      marketingChannels: [
        'LinkedIn',
        'Google Ads',
        'Content Marketing',
        'Email',
      ],
      strengths: [
        'Strong brand recognition',
        'Comprehensive feature set',
        'Good customer support',
      ],
      weaknesses: [
        'High pricing for small businesses',
        'Complex onboarding process',
        'Limited customization options',
      ],
      opportunities: [
        'Growing demand for AI tools',
        'Expansion to new markets',
        'Partnership opportunities',
      ],
      threats: [
        'New competitors entering market',
        'Economic downturn affecting budgets',
        'Regulatory changes',
      ],
    };
  }

  // Luo mock ICP:t
  generateMockICPs(): ICP[] {
    return [
      {
        name: 'Tech-savvy Startup Founder',
        description:
          'Nuori startup-perustaja, joka etsii tehokkaita markkinointityökaluja',
        demographics: {
          age: '25-35',
          gender: 'Sekä miehet että naiset',
          location: 'Helsinki, Espoo, Vantaa',
          income: '€50,000-100,000',
          education: 'Korkeakoulututkinto',
        },
        psychographics: {
          interests: ['Teknologia', 'Yrittäjyys', 'Innovaatio'],
          values: ['Tehokkuus', 'Skalautuvuus', 'Laatu'],
          lifestyle: 'Kiireinen, teknologiaorientoitunut',
          painPoints: [
            'Ajan puute',
            'Rajoitettu budjetti',
            'Monimutkaiset työkalut',
          ],
        },
        behavior: {
          onlineHabits: ['Sosiaalinen media', 'LinkedIn', 'Tech-blogit'],
          purchasingBehavior: 'Tutkii huolellisesti, vertailee vaihtoehtoja',
          brandPreferences: ['Apple', 'Slack', 'Notion'],
        },
        goals: [
          'Kasvattaa liiketoimintaa',
          'Parantaa markkinointitehokkuutta',
          'Säästää aikaa',
        ],
        challenges: [
          'Rajoitettu markkinointibudjetti',
          'Kilpailu',
          'Ajan puute',
        ],
        preferredChannels: ['LinkedIn', 'Email', 'Content Marketing'],
      },
      {
        name: 'Marketing Manager',
        description:
          'Kokemusmarkkinointipäällikkö, joka haluaa parantaa kampanjoiden tehokkuutta',
        demographics: {
          age: '30-45',
          gender: 'Sekä miehet että naiset',
          location: 'Suurkaupungit',
          income: '€60,000-120,000',
          education: 'Korkeakoulututkinto',
        },
        psychographics: {
          interests: ['Markkinointi', 'Analytiikka', 'Strategia'],
          values: ['Tulokset', 'Data', 'Kokemus'],
          lifestyle: 'Ammattimainen, tuloksista kiinnostunut',
          painPoints: ['ROI-mittaaminen', 'Budjetin hallinta', 'Ajan puute'],
        },
        behavior: {
          onlineHabits: ['LinkedIn', 'Marketing-blogit', 'Analytics-työkalut'],
          purchasingBehavior: 'Tutkii dataa, haluaa ROI:n',
          brandPreferences: ['Google Analytics', 'HubSpot', 'Mailchimp'],
        },
        goals: [
          'Parantaa kampanjoiden ROI:ta',
          'Automatisoida prosesseja',
          'Kasvattaa konversioita',
        ],
        challenges: ['Budjetin rajoitukset', 'Kilpailu', 'Teknologian muutos'],
        preferredChannels: [
          'LinkedIn',
          'Email',
          'Content Marketing',
          'Google Ads',
        ],
      },
    ];
  }
}
