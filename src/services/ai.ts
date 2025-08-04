import { OpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Types for ICP analysis
export interface ICP {
  id: string;
  name: string;
  demographics: {
    ageRange: { min: number; max: number };
    gender: { male: number; female: number };
    location: string[];
    incomeLevel: 'low' | 'medium' | 'high';
  };
  psychographics: {
    jobTitles: string[];
    companySize: string[];
    industry: string[];
    painPoints: string[];
  };
  behavior: {
    buyingPower: number;
    decisionMaking: string;
    preferredChannels: string[];
  };
  description: string;
  confidence: number;
}

export interface CompetitorData {
  name: string;
  website: string;
  social: string;
  websiteContent?: string;
  socialContent?: string;
}

export interface CustomerReview {
  text: string;
  rating?: number;
  source: string;
}

// AI Service class
export class AIService {
  private openai: OpenAI;
  private icpChain: LLMChain;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      openAIApiKey: apiKey,
      temperature: 0.7,
    });

    // Create ICP generation prompt
    const icpPrompt = PromptTemplate.fromTemplate(`
      Analyze the following competitor and customer data to generate Ideal Customer Personas (ICPs).
      
      Competitor Data:
      {competitorData}
      
      Customer Reviews:
      {customerReviews}
      
      Additional Context:
      {additionalContext}
      
      Generate 3-5 detailed ICPs in the following JSON format:
      {{
        "icps": [
          {{
            "id": "icp_1",
            "name": "Descriptive ICP Name",
            "demographics": {{
              "ageRange": {{ "min": 25, "max": 35 }},
              "gender": {{ "male": 40, "female": 60 }},
              "location": ["Helsinki", "Espoo", "Vantaa"],
              "incomeLevel": "medium"
            }},
            "psychographics": {{
              "jobTitles": ["Marketing Manager", "Product Manager"],
              "companySize": ["10-50 employees", "Startup"],
              "industry": ["Tech", "E-commerce"],
              "painPoints": ["Limited budget", "Time constraints"]
            }},
            "behavior": {{
              "buyingPower": 7,
              "decisionMaking": "Data-driven",
              "preferredChannels": ["LinkedIn", "Email"]
            }},
            "description": "Detailed description of this ICP",
            "confidence": 85
          }}
        ]
      }}
      
      Focus on extracting demographic information (age, gender, location) from the data.
      Be specific about age ranges, gender distribution, and geographic locations.
      Provide confidence scores based on data quality.
    `);

    this.icpChain = new LLMChain({
      llm: this.openai,
      prompt: icpPrompt,
    });
  }

  // Scrape competitor website content
  async scrapeWebsite(url: string): Promise<string> {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Extract relevant content
      const title = $('title').text();
      const description = $('meta[name="description"]').attr('content') || '';
      const headings = $('h1, h2, h3')
        .map((_, el) => $(el).text())
        .get()
        .join(' ');
      const paragraphs = $('p')
        .map((_, el) => $(el).text())
        .get()
        .join(' ');

      return `${title}\n${description}\n${headings}\n${paragraphs}`;
    } catch (error) {
      console.error('Error scraping website:', error);
      return '';
    }
  }

  // Analyze customer reviews for demographic information
  analyzeReviews(reviews: CustomerReview[]): string {
    const reviewTexts = reviews.map((r) => r.text).join('\n');

    // Simple NLP patterns for demographic extraction
    const patterns = {
      age: /(\d{1,2})v|(\d{1,2})-(\d{1,2})v|(\d{1,2})vuotias/gi,
      gender: /(naisena|miehenä|tyttö|poika|nainen|mies)/gi,
      location: /(Helsingissä|Tampereella|Turussa|Oulussa|pääkaupunkiseutu)/gi,
      job: /(managerina|yrittäjänä|opiskelijana|työntekijänä)/gi,
    };

    let analysis = 'Demographic patterns found:\n';

    // Extract age patterns
    const ageMatches = reviewTexts.match(patterns.age);
    if (ageMatches) {
      analysis += `Age references: ${ageMatches.join(', ')}\n`;
    }

    // Extract gender patterns
    const genderMatches = reviewTexts.match(patterns.gender);
    if (genderMatches) {
      analysis += `Gender references: ${genderMatches.join(', ')}\n`;
    }

    // Extract location patterns
    const locationMatches = reviewTexts.match(patterns.location);
    if (locationMatches) {
      analysis += `Location references: ${locationMatches.join(', ')}\n`;
    }

    // Extract job patterns
    const jobMatches = reviewTexts.match(patterns.job);
    if (jobMatches) {
      analysis += `Job references: ${jobMatches.join(', ')}\n`;
    }

    return analysis + '\nFull reviews:\n' + reviewTexts;
  }

  // Generate ICPs using AI
  async generateICPs(
    competitors: CompetitorData[],
    reviews: CustomerReview[],
    additionalContext: string = '',
  ): Promise<ICP[]> {
    try {
      // Scrape competitor websites
      const competitorData = await Promise.all(
        competitors.map(async (comp) => {
          const websiteContent = comp.website
            ? await this.scrapeWebsite(comp.website)
            : '';
          return {
            ...comp,
            websiteContent,
          };
        }),
      );

      // Analyze reviews
      const reviewAnalysis = this.analyzeReviews(reviews);

      // Prepare data for AI
      const competitorDataText = competitorData
        .map(
          (comp) => `
          Name: ${comp.name}
          Website: ${comp.website}
          Social: ${comp.social}
          Website Content: ${comp.websiteContent}
        `,
        )
        .join('\n');

      // Generate ICPs using AI
      const result = await this.icpChain.call({
        competitorData: competitorDataText,
        customerReviews: reviewAnalysis,
        additionalContext,
      });

      // Parse AI response
      const response = result.text as string;
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.icps || [];
      }

      return [];
    } catch (error) {
      console.error('Error generating ICPs:', error);
      return [];
    }
  }

  // Mock ICP generation for testing
  generateMockICPs(): ICP[] {
    return [
      {
        id: 'icp_1',
        name: 'Tech-savvy Marketing Managers',
        demographics: {
          ageRange: { min: 28, max: 35 },
          gender: { male: 40, female: 60 },
          location: ['Helsinki', 'Espoo', 'Vantaa'],
          incomeLevel: 'medium',
        },
        psychographics: {
          jobTitles: ['Marketing Manager', 'Digital Marketing Specialist'],
          companySize: ['10-50 employees', 'Startup'],
          industry: ['Tech', 'E-commerce'],
          painPoints: ['Limited budget', 'Time constraints', 'ROI measurement'],
        },
        behavior: {
          buyingPower: 7,
          decisionMaking: 'Data-driven',
          preferredChannels: ['LinkedIn', 'Email', 'Google Ads'],
        },
        description:
          'Young marketing professionals in growing tech companies who need efficient, ROI-driven marketing solutions.',
        confidence: 85,
      },
      {
        id: 'icp_2',
        name: 'E-commerce Entrepreneurs',
        demographics: {
          ageRange: { min: 25, max: 40 },
          gender: { male: 50, female: 50 },
          location: ['Koko Suomi'],
          incomeLevel: 'high',
        },
        psychographics: {
          jobTitles: ['Founder', 'CEO', 'E-commerce Manager'],
          companySize: ['1-10 employees', 'Solo entrepreneur'],
          industry: ['E-commerce', 'Retail'],
          painPoints: [
            'Scaling challenges',
            'Customer acquisition',
            'Inventory management',
          ],
        },
        behavior: {
          buyingPower: 8,
          decisionMaking: 'Growth-focused',
          preferredChannels: ['Facebook', 'Instagram', 'TikTok'],
        },
        description:
          'Ambitious e-commerce entrepreneurs looking to scale their online businesses with effective marketing tools.',
        confidence: 90,
      },
    ];
  }
}
