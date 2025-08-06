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

      const prompt = `Create 3 Ideal Customer Profile (ICP) profiles based on the following data:

Competitors:
${competitorInfo}

Customer Reviews:
${reviewTexts}

Additional Context:
${additionalContext}

Respond ONLY with valid JSON array containing exactly 3 ICP objects. Each ICP must have this exact structure:

[
  {
    "name": "Profile name",
    "description": "Profile description",
    "demographics": {
      "age": "Age range",
      "gender": "Gender",
      "location": "Location",
      "income": "Income level",
      "education": "Education level"
    },
    "psychographics": {
      "interests": ["interest1", "interest2"],
      "values": ["value1", "value2"],
      "lifestyle": "Lifestyle description",
      "painPoints": ["pain1", "pain2"]
    },
    "behavior": {
      "onlineHabits": ["habit1", "habit2"],
      "purchasingBehavior": "Purchasing behavior description",
      "brandPreferences": ["brand1", "brand2"]
    },
    "goals": ["goal1", "goal2"],
    "challenges": ["challenge1", "challenge2"],
    "preferredChannels": ["channel1", "channel2", "channel3"]
  }
]

IMPORTANT: For "preferredChannels", consider the ICP's demographics, industry, and behavior to suggest specific marketing channels. Include a mix of:
- Digital channels (social media platforms, websites, email, etc.)
- Traditional channels (events, conferences, print media, etc.)
- Industry-specific channels (trade shows, professional networks, etc.)
- Content channels (blogs, podcasts, webinars, etc.)

Examples of diverse channels:
- LinkedIn, Twitter, Facebook, Instagram, TikTok
- Industry conferences, trade shows, networking events
- Google Ads, Facebook Ads, YouTube ads
- Email marketing, newsletters, direct mail
- Podcasts, webinars, YouTube channels
- Industry publications, blogs, whitepapers
- Professional associations, online communities
- Referral programs, partnerships

Choose channels that match the ICP's age, industry, online habits, and purchasing behavior.

Respond with ONLY the JSON array, no additional text or explanations.`;

      const response = await axios.post(this.ollamaUrl, {
        model: 'llama2:7b',
        prompt: prompt,
        stream: false,
      });

      const responseText = response.data.response;
      console.log('Raw Ollama response:', responseText);

      try {
        // Try to extract JSON from the response
        let jsonText = responseText;

        // Look for JSON array start and end
        const jsonStart = jsonText.indexOf('[');
        const jsonEnd = jsonText.lastIndexOf(']');

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
        }

        // Clean up any extra characters
        jsonText = jsonText.trim();

        // Parse the JSON
        const icps = JSON.parse(jsonText);

        // Ensure we have an array
        if (Array.isArray(icps)) {
          // Fix missing fields in each ICP
          const fixedICPs = icps.map((icp: Partial<ICP>) => {
            // Ensure all required fields exist
            const fixedICP: ICP = {
              name: icp.name || 'Unknown Profile',
              description: icp.description || 'Profile description',
              demographics: {
                age: icp.demographics?.age || '25-45',
                gender: icp.demographics?.gender || 'Mixed',
                location: icp.demographics?.location || 'Urban areas',
                income: icp.demographics?.income || 'Middle income',
                education:
                  icp.demographics?.education || 'Bachelor degree or higher',
              },
              psychographics: {
                interests: Array.isArray(icp.psychographics?.interests)
                  ? icp.psychographics.interests
                  : ['Technology', 'Business'],
                values: Array.isArray(icp.psychographics?.values)
                  ? icp.psychographics.values
                  : ['Quality', 'Efficiency'],
                lifestyle: icp.psychographics?.lifestyle || 'Professional',
                painPoints: Array.isArray(icp.psychographics?.painPoints)
                  ? icp.psychographics.painPoints
                  : ['Time constraints', 'Complex solutions'],
              },
              behavior: {
                onlineHabits: Array.isArray(icp.behavior?.onlineHabits)
                  ? icp.behavior.onlineHabits
                  : ['Social media', 'Professional networks'],
                purchasingBehavior:
                  icp.behavior?.purchasingBehavior ||
                  'Research-driven decisions',
                brandPreferences: Array.isArray(icp.behavior?.brandPreferences)
                  ? icp.behavior.brandPreferences
                  : ['Established brands', 'Innovative companies'],
              },
              goals: Array.isArray(icp.goals)
                ? icp.goals
                : ['Business growth', 'Efficiency improvement'],
              challenges: Array.isArray(icp.challenges)
                ? icp.challenges
                : ['Finding the right solution', 'Implementation time'],
              preferredChannels: Array.isArray(icp.preferredChannels)
                ? icp.preferredChannels
                : this.generatePreferredChannels(icp),
            };
            return fixedICP;
          });

          return fixedICPs;
        } else if (icps && typeof icps === 'object') {
          // Single ICP object - wrap in array and fix
          const fixedICP: ICP = {
            name: icps.name || 'Unknown Profile',
            description: icps.description || 'Profile description',
            demographics: {
              age: icps.demographics?.age || '25-45',
              gender: icps.demographics?.gender || 'Mixed',
              location: icps.demographics?.location || 'Urban areas',
              income: icps.demographics?.income || 'Middle income',
              education:
                icps.demographics?.education || 'Bachelor degree or higher',
            },
            psychographics: {
              interests: Array.isArray(icps.psychographics?.interests)
                ? icps.psychographics.interests
                : ['Technology', 'Business'],
              values: Array.isArray(icps.psychographics?.values)
                ? icps.psychographics.values
                : ['Quality', 'Efficiency'],
              lifestyle: icps.psychographics?.lifestyle || 'Professional',
              painPoints: Array.isArray(icps.psychographics?.painPoints)
                ? icps.psychographics.painPoints
                : ['Time constraints', 'Complex solutions'],
            },
            behavior: {
              onlineHabits: Array.isArray(icps.behavior?.onlineHabits)
                ? icps.behavior.onlineHabits
                : ['Social media', 'Professional networks'],
              purchasingBehavior:
                icps.behavior?.purchasingBehavior ||
                'Research-driven decisions',
              brandPreferences: Array.isArray(icps.behavior?.brandPreferences)
                ? icps.behavior.brandPreferences
                : ['Established brands', 'Innovative companies'],
            },
            goals: Array.isArray(icps.goals)
              ? icps.goals
              : ['Business growth', 'Efficiency improvement'],
            challenges: Array.isArray(icps.challenges)
              ? icps.challenges
              : ['Finding the right solution', 'Implementation time'],
            preferredChannels: Array.isArray(icps.preferredChannels)
              ? icps.preferredChannels
              : this.generatePreferredChannels(icps),
          };
          return [fixedICP];
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);

        // Fallback: create a simple ICP structure
        const fallbackICPs: ICP[] = [
          {
            name: 'Default ICP Profile',
            description: 'Generated based on competitor analysis',
            demographics: {
              age: '25-45',
              gender: 'Mixed',
              location: 'Urban areas',
              income: 'Middle income',
              education: 'Bachelor degree or higher',
            },
            psychographics: {
              interests: ['Technology', 'Business', 'Innovation'],
              values: ['Quality', 'Efficiency', 'Growth'],
              lifestyle: 'Busy professionals',
              painPoints: [
                'Time constraints',
                'Complex solutions',
                'High costs',
              ],
            },
            behavior: {
              onlineHabits: ['Social media', 'Professional networks'],
              purchasingBehavior: 'Research-driven decisions',
              brandPreferences: ['Established brands', 'Innovative companies'],
            },
            goals: [
              'Business growth',
              'Efficiency improvement',
              'Cost reduction',
            ],
            challenges: [
              'Finding the right solution',
              'Implementation time',
              'Budget constraints',
            ],
            preferredChannels: [
              'LinkedIn',
              'Professional websites',
              'Industry events',
              'Email marketing',
              'Google Ads',
              'Trade shows',
            ],
          },
        ];

        console.log('Using fallback ICP structure due to parsing error');
        return fallbackICPs;
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

  private generatePreferredChannels(icp: Partial<ICP>): string[] {
    const channels: string[] = [];
    const age = icp.demographics?.age || 'Mixed';
    const gender = icp.demographics?.gender || 'Mixed';
    const income = icp.demographics?.income || 'Middle income';
    const interests = icp.psychographics?.interests || [
      'Technology',
      'Business',
    ];

    // Digital channels
    if (
      age.includes('25-45') &&
      gender.includes('Male') &&
      income.includes('High income')
    ) {
      channels.push('LinkedIn');
      channels.push('Twitter');
      channels.push('Facebook');
      channels.push('Instagram');
      channels.push('TikTok');
    } else if (
      age.includes('35-55') &&
      gender.includes('Female') &&
      income.includes('Middle income')
    ) {
      channels.push('Pinterest');
      channels.push('Snapchat');
    }

    // Traditional channels
    if (
      age.includes('25-45') &&
      gender.includes('Male') &&
      income.includes('High income')
    ) {
      channels.push('Industry conferences');
      channels.push('Networking events');
    } else if (
      age.includes('35-55') &&
      gender.includes('Female') &&
      income.includes('Middle income')
    ) {
      channels.push('Local workshops');
      channels.push('Meetups');
    }

    // Industry-specific channels
    if (interests.includes('Finance') && income.includes('High income')) {
      channels.push('Investment forums');
      channels.push('Financial blogs');
    } else if (
      interests.includes('Healthcare') &&
      income.includes('High income')
    ) {
      channels.push('Medical conferences');
      channels.push('Healthcare blogs');
    }

    // Content channels
    if (interests.includes('Reading') && income.includes('High income')) {
      channels.push('Business magazines');
      channels.push('Financial news websites');
    } else if (interests.includes('Travel') && income.includes('High income')) {
      channels.push('Travel blogs');
      channels.push('Luxury travel magazines');
    }

    // Mix of channels
    if (channels.length < 3) {
      channels.push('Email marketing');
      channels.push('Newsletters');
      channels.push('Direct mail');
    }

    return channels;
  }
}
