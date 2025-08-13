import type {
  ICP,
  CompetitorData,
  CustomerReview,
  ApifyBasedICP,
  ApifyDataSource,
} from './types';
import { OllamaClient } from './ollama-client';
import { AIServiceErrorFactory, InputValidator } from './error-types';
import { ReviewAnalyzer } from './review-analyzer';
import { companyDataService } from '../company-data-service';

// Enhanced ICP types for Instruction Framework
export interface ICPContext {
  type: 'B2B' | 'B2C';
  confidence: number;
  reasoning: string;
}

export interface ICPAttributes {
  // B2B Attributes
  firmographics?: {
    companySize: string;
    industry: string;
    revenue: string;
    employeeCount: string;
  };
  technographics?: {
    technologyStack: string[];
    digitalMaturity: string;
    automationLevel: string;
  };
  growthStage?: string;
  decisionMakingStructure?: string;
  buyingCycle?: string;
  purchaseMotivations?: string[];

  // B2C Attributes
  demographics?: {
    age: string;
    gender: string;
    location: string;
    income: string;
    education: string;
  };
  psychographics?: {
    interests: string[];
    values: string[];
    lifestyle: string;
    personality: string;
  };
  behavioralData?: {
    onlineHabits: string[];
    purchasingBehavior: string;
    brandPreferences: string[];
  };
  triggers?: string[];
}

export interface ICPTemplate {
  name: string;
  description: string;
  attributes: ICPAttributes;
  context: 'B2B' | 'B2C';
}

export class ICPGenerator {
  private ollamaClient: OllamaClient;

  // ICP Templates from Instruction Framework
  private b2bTemplates: ICPTemplate[] = [
    {
      name: 'Startup Innovators',
      description: 'Small, agile, high experimentation rate.',
      context: 'B2B',
      attributes: {
        firmographics: {
          companySize: 'Startup',
          industry: 'Technology',
          revenue: '< $1M',
          employeeCount: '< 50',
        },
        growthStage: 'Early Stage',
        decisionMakingStructure: 'Fast decisions',
        buyingCycle: 'Quick evaluation',
        purchaseMotivations: [
          'Innovation',
          'Speed to market',
          'Cost efficiency',
        ],
      },
    },
    {
      name: 'Process Optimizers',
      description: 'Medium-sized, seeking efficiency.',
      context: 'B2B',
      attributes: {
        firmographics: {
          companySize: 'Scale-up',
          industry: 'Mixed',
          revenue: '$1M - $10M',
          employeeCount: '50-200',
        },
        growthStage: 'Scale-up stage',
        decisionMakingStructure: 'Process-driven',
        buyingCycle: 'Evaluation period',
        purchaseMotivations: [
          'Efficiency',
          'Automation',
          'Process improvement',
        ],
      },
    },
    {
      name: 'Established Loyalists',
      description: 'Large, risk-averse.',
      context: 'B2B',
      attributes: {
        firmographics: {
          companySize: 'Enterprise',
          industry: 'Established',
          revenue: '> $10M',
          employeeCount: '> 500',
        },
        growthStage: 'Mature',
        decisionMakingStructure: 'Committee-based',
        buyingCycle: 'Long RFP cycles',
        purchaseMotivations: [
          'Risk mitigation',
          'Proven solutions',
          'Stability',
        ],
      },
    },
    {
      name: 'Price-Driven Competitors',
      description: 'Chooses lowest bidder.',
      context: 'B2B',
      attributes: {
        firmographics: {
          companySize: 'Mixed',
          industry: 'Competitive',
          revenue: 'Mixed',
          employeeCount: 'Mixed',
        },
        decisionMakingStructure: 'Price-focused',
        buyingCycle: 'Long RFP cycles',
        purchaseMotivations: [
          'Cost reduction',
          'Budget constraints',
          'Competitive pricing',
        ],
      },
    },
  ];

  private b2cTemplates: ICPTemplate[] = [
    {
      name: 'Trend-Conscious Urbanite',
      description: 'Young, city-based, social media active.',
      context: 'B2C',
      attributes: {
        demographics: {
          age: '20-30',
          gender: 'Mixed',
          location: 'Urban areas',
          income: 'Middle income',
          education: 'Bachelor degree',
        },
        psychographics: {
          interests: ['Technology', 'Social media', 'Trends'],
          values: ['Innovation', 'Social connection', 'Self-expression'],
          lifestyle: 'Urban professional',
          personality: 'Early adopter',
        },
        behavioralData: {
          onlineHabits: ['Social media', 'Mobile apps', 'Online shopping'],
          purchasingBehavior: 'Impulse-driven',
          brandPreferences: ['Trendy brands', 'Social media presence'],
        },
        triggers: [
          'Social media trends',
          'Peer recommendations',
          'Limited time offers',
        ],
      },
    },
    {
      name: 'Price-Conscious Family',
      description: 'Family-oriented, seeks deals.',
      context: 'B2C',
      attributes: {
        demographics: {
          age: '30-50',
          gender: 'Mixed',
          location: 'Suburban',
          income: 'Middle income',
          education: 'Mixed',
        },
        psychographics: {
          interests: ['Family activities', 'Budgeting', 'Value'],
          values: ['Family', 'Financial security', 'Practicality'],
          lifestyle: 'Family-focused',
          personality: 'Practical',
        },
        behavioralData: {
          onlineHabits: [
            'Email newsletters',
            'Comparison shopping',
            'Family apps',
          ],
          purchasingBehavior: 'Research-driven',
          brandPreferences: ['Value brands', 'Family-friendly'],
        },
        triggers: ['Sales and discounts', 'Family needs', 'Seasonal events'],
      },
    },
    {
      name: 'Quality-Focused Hobbyist',
      description: 'Invests in passion.',
      context: 'B2C',
      attributes: {
        demographics: {
          age: '35-65',
          gender: 'Mixed',
          location: 'Mixed',
          income: 'Middle to high income',
          education: 'Mixed',
        },
        psychographics: {
          interests: ['Niche hobbies', 'Quality products', 'Expertise'],
          values: ['Quality', 'Expertise', 'Passion'],
          lifestyle: 'Hobby-focused',
          personality: 'Enthusiast',
        },
        behavioralData: {
          onlineHabits: [
            'Specialized forums',
            'Expert reviews',
            'Niche communities',
          ],
          purchasingBehavior: 'Research-intensive',
          brandPreferences: ['Premium brands', 'Expert recommendations'],
        },
        triggers: [
          'New product releases',
          'Expert reviews',
          'Community recommendations',
        ],
      },
    },
    {
      name: 'Impulse Buyer',
      description: 'Quick, emotion-driven purchases.',
      context: 'B2C',
      attributes: {
        demographics: {
          age: '18-45',
          gender: 'Mixed',
          location: 'Mixed',
          income: 'Mixed',
          education: 'Mixed',
        },
        psychographics: {
          interests: ['Entertainment', 'Shopping', 'Social media'],
          values: ['Instant gratification', 'Social status', 'Entertainment'],
          lifestyle: 'Fast-paced',
          personality: 'Impulsive',
        },
        behavioralData: {
          onlineHabits: [
            'Social media',
            'Shopping apps',
            'Entertainment platforms',
          ],
          purchasingBehavior: 'Emotion-driven',
          brandPreferences: ['Popular brands', 'Trendy products'],
        },
        triggers: ['Emotional appeals', 'Limited time offers', 'Social proof'],
      },
    },
  ];

  constructor() {
    this.ollamaClient = OllamaClient.getInstance();
  }

  /**
   * Enhanced ICP generation implementing the Instruction Framework
   */
  async generateICPs(
    competitors: CompetitorData[],
    reviews: CustomerReview[],
    additionalContext: string = '',
  ): Promise<ICP[]> {
    return this.generateApifyBasedICPs(competitors, reviews, additionalContext);
  }

  /**
   * Enhanced ICP generation that implements the Instruction Framework
   */
  async generateApifyBasedICPs(
    competitors: CompetitorData[],
    reviews: CustomerReview[],
    additionalContext: string = '',
    dataSources?: ApifyDataSource[],
  ): Promise<ApifyBasedICP[]> {
    console.log(`🎯 Starting Instruction Framework ICP generation:`);
    console.log(`   🏢 Competitors: ${competitors.length}`);
    console.log(`   📝 Reviews: ${reviews.length}`);
    console.log(`   📊 Apify Data Sources: ${dataSources?.length || 0}`);
    console.log(
      `   📋 Additional context: ${additionalContext ? 'Yes' : 'No'}`,
    );

    // Validate input data
    const validation = InputValidator.validateICPGenerationInput(
      competitors,
      additionalContext,
    );

    if (!validation.isValid) {
      const error = AIServiceErrorFactory.createICPGenerationError(
        'INVALID_INPUT_DATA',
        `Input validation failed: ${validation.errors
          .map((e) => e.message)
          .join(', ')}`,
        {
          competitorCount: competitors.length,
          reviewCount: reviews.length,
          hasAdditionalContext: additionalContext.length > 0,
          validationErrors: validation.errors,
        },
      );
      throw error;
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn(`⚠️ Input validation warnings:`, validation.warnings);
    }

    try {
      // Step 1: Determine Context (B2B or B2C)
      console.log(`🔍 Determining B2B/B2C context...`);
      const context = await this.determineContext(
        competitors,
        reviews,
        additionalContext,
      );
      console.log(
        `   📊 Context: ${context.type} (confidence: ${context.confidence}%)`,
      );

      // Step 2: Select Attribute Set
      console.log(`🎯 Selecting attribute set for ${context.type}...`);
      const attributeSet = this.selectAttributeSet(context.type);

      // Step 3: Analyze Data
      console.log(`📊 Analyzing data with ${context.type} attributes...`);
      const analysis = await this.analyzeDataWithAttributes(
        competitors,
        reviews,
        additionalContext,
        attributeSet,
        context,
      );

      // Step 4: Assign ICP Types
      console.log(`🏷️ Assigning ICP types...`);
      const icpTypes = this.assignICPTypes(analysis, context.type);

      // Step 5: Generate Output
      console.log(`📝 Generating ICP profiles...`);
      const icps = await this.generateICPsFromTypes(
        icpTypes,
        analysis,
        dataSources,
      );

      console.log(`✅ Instruction Framework ICP generation completed:`);
      console.log(`   👥 ICP profiles created: ${icps.length}`);

      return icps;
    } catch (error) {
      console.error(`❌ ICP generation failed:`, error);
      throw error;
    }
  }

  /**
   * Step 1: Determine Context (B2B or B2C)
   */
  private async determineContext(
    competitors: CompetitorData[],
    reviews: CustomerReview[],
    additionalContext: string,
  ): Promise<ICPContext> {
    const prompt = `Analyze the following data to determine if this is a B2B or B2C context:

Competitors: ${competitors.map((c) => `${c.name} (${c.website})`).join('\n')}
Reviews: ${reviews
      .slice(0, 5)
      .map((r) => r.text)
      .join('\n')}
Additional Context: ${additionalContext}

B2B Indicators:
- Company names, business websites, enterprise solutions
- Professional terminology, industry-specific language
- Business pain points, ROI discussions, implementation concerns
- Decision-making processes, procurement mentions

B2C Indicators:
- Individual consumer language, personal experiences
- Product reviews, personal recommendations
- Lifestyle mentions, personal preferences
- Individual purchasing decisions

Respond with JSON:
{
  "type": "B2B" or "B2C",
  "confidence": 0-100,
  "reasoning": "explanation of your decision"
}`;

    try {
      const response = await this.ollamaClient.generateResponse(prompt);
      const context = JSON.parse(response);
      return {
        type: context.type === 'B2B' ? 'B2B' : 'B2C',
        confidence: Math.min(100, Math.max(0, context.confidence || 50)),
        reasoning: context.reasoning || 'Analysis based on data patterns',
      };
    } catch (error) {
      console.warn('Context detection failed, defaulting to B2B:', error);
      return {
        type: 'B2B',
        confidence: 50,
        reasoning: 'Default fallback due to analysis error',
      };
    }
  }

  /**
   * Step 2: Select Attribute Set
   */
  private selectAttributeSet(contextType: 'B2B' | 'B2C'): string[] {
    if (contextType === 'B2B') {
      return [
        'firmographics',
        'technographics',
        'growthStage',
        'decisionMakingStructure',
        'buyingCycle',
        'purchaseMotivations',
      ];
    } else {
      return ['demographics', 'psychographics', 'behavioralData', 'triggers'];
    }
  }

  /**
   * Step 3: Analyze Data with Attributes
   */
  private async analyzeDataWithAttributes(
    competitors: CompetitorData[],
    reviews: CustomerReview[],
    additionalContext: string,
    attributeSet: string[],
    context: ICPContext,
  ): Promise<Record<string, unknown>> {
    const competitorInfo = competitors
      .map((c) => `${c.name} (${c.website})`)
      .join('\n');
    const reviewTexts = reviews.map((r) => r.text).join('\n');

    // Enhanced review analysis
    const reviewAnalysis = ReviewAnalyzer.analyzeBatch(reviews);
    const icpInsights = ReviewAnalyzer.extractICPInsights(reviews);

    const prompt = this.buildInstructionFrameworkPrompt(
      competitorInfo,
      reviewTexts,
      additionalContext,
      attributeSet,
      context,
      reviewAnalysis as unknown as Record<string, unknown>,
      icpInsights,
    );

    const response = await this.ollamaClient.generateResponse(prompt);
    return JSON.parse(response);
  }

  /**
   * Step 4: Assign ICP Types
   */
  private assignICPTypes(
    analysis: Record<string, unknown>,
    contextType: 'B2B' | 'B2C',
  ): string[] {
    const templates =
      contextType === 'B2B' ? this.b2bTemplates : this.b2cTemplates;

    // Simple matching logic - in production, this would be more sophisticated
    const matchedTypes: string[] = [];

    if (contextType === 'B2B') {
      const companySize =
        typeof analysis.companySize === 'string' ? analysis.companySize : '';
      const employeeCount =
        typeof analysis.employeeCount === 'number' ? analysis.employeeCount : 0;
      const decisionMaking =
        typeof analysis.decisionMaking === 'string'
          ? analysis.decisionMaking
          : '';
      const riskAversion = Boolean(analysis.riskAversion);
      const priceSensitivity = Boolean(analysis.priceSensitivity);
      const budgetFocus = Boolean(analysis.budgetFocus);

      if (companySize.includes('startup') || employeeCount < 50) {
        matchedTypes.push('Startup Innovators');
      }
      if (decisionMaking === 'process-driven' || employeeCount >= 50) {
        matchedTypes.push('Process Optimizers');
      }
      if (employeeCount > 500 || riskAversion) {
        matchedTypes.push('Established Loyalists');
      }
      if (priceSensitivity || budgetFocus) {
        matchedTypes.push('Price-Driven Competitors');
      }
    } else {
      const age = typeof analysis.age === 'string' ? analysis.age : '';
      const socialMediaActive = Boolean(analysis.socialMediaActive);
      const familyOriented = Boolean(analysis.familyOriented);
      const priceConscious = Boolean(analysis.priceConscious);
      const qualityFocused = Boolean(analysis.qualityFocused);
      const expertiseSeeking = Boolean(analysis.expertiseSeeking);
      const impulseDriven = Boolean(analysis.impulseDriven);
      const emotionDriven = Boolean(analysis.emotionDriven);

      if (age.includes('20-30') || socialMediaActive) {
        matchedTypes.push('Trend-Conscious Urbanite');
      }
      if (familyOriented || priceConscious) {
        matchedTypes.push('Price-Conscious Family');
      }
      if (qualityFocused || expertiseSeeking) {
        matchedTypes.push('Quality-Focused Hobbyist');
      }
      if (impulseDriven || emotionDriven) {
        matchedTypes.push('Impulse Buyer');
      }
    }

    // Ensure we have at least 3 types
    while (matchedTypes.length < 3) {
      const availableTypes = templates
        .map((t) => t.name)
        .filter((name) => !matchedTypes.includes(name));
      if (availableTypes.length > 0) {
        matchedTypes.push(availableTypes[0]);
      } else {
        break;
      }
    }

    return matchedTypes.slice(0, 3);
  }

  /**
   * Step 5: Generate ICPs from Types
   */
  private async generateICPsFromTypes(
    icpTypes: string[],
    analysis: Record<string, unknown>,
    dataSources?: ApifyDataSource[],
  ): Promise<ApifyBasedICP[]> {
    const templates = [...this.b2bTemplates, ...this.b2cTemplates];
    const icps: ApifyBasedICP[] = [];

    for (const typeName of icpTypes) {
      const template = templates.find((t) => t.name === typeName);
      if (template) {
        const icp = this.createICPFromTemplate(template, analysis, dataSources);
        icps.push(icp);
      }
    }

    return icps;
  }

  /**
   * Create ICP from template
   */
  private createICPFromTemplate(
    template: ICPTemplate,
    analysis: Record<string, unknown>,
    dataSources?: ApifyDataSource[],
  ): ApifyBasedICP {
    // Convert template to ICP format
    const icp: ApifyBasedICP = {
      name: template.name,
      description: template.description,
      demographics: {
        age: template.attributes.demographics?.age || '25-45',
        gender: template.attributes.demographics?.gender || 'Mixed',
        location: template.attributes.demographics?.location || 'Mixed',
        income: template.attributes.demographics?.income || 'Middle income',
        education: template.attributes.demographics?.education || 'Mixed',
      },
      psychographics: {
        interests: template.attributes.psychographics?.interests || [
          'Business',
          'Technology',
        ],
        values: template.attributes.psychographics?.values || [
          'Quality',
          'Efficiency',
        ],
        lifestyle:
          template.attributes.psychographics?.lifestyle || 'Professional',
        painPoints: Array.isArray(analysis.painPoints)
          ? (analysis.painPoints as string[])
          : ['Time constraints', 'Complex solutions'],
      },
      behavior: {
        onlineHabits: template.attributes.behavioralData?.onlineHabits || [
          'Social media',
          'Professional networks',
        ],
        purchasingBehavior:
          template.attributes.behavioralData?.purchasingBehavior ||
          'Research-driven decisions',
        brandPreferences: template.attributes.behavioralData
          ?.brandPreferences || ['Established brands', 'Innovative companies'],
      },
      goals: Array.isArray(analysis.goals)
        ? (analysis.goals as string[])
        : ['Business growth', 'Efficiency improvement'],
      challenges: Array.isArray(analysis.challenges)
        ? (analysis.challenges as string[])
        : ['Finding the right solution', 'Implementation time'],
      preferredChannels: this.generatePreferredChannelsFromTemplate(template),
      dataSources: dataSources || [],
      confidence: this.calculateConfidence(
        Array.isArray(analysis.reviews)
          ? (analysis.reviews as CustomerReview[])
          : [],
        dataSources,
      ),
      marketInsights: this.extractMarketInsights(
        Array.isArray(analysis.reviews)
          ? (analysis.reviews as CustomerReview[])
          : [],
        dataSources,
      ),
    };

    return icp;
  }

  /**
   * Build Instruction Framework prompt
   */
  private buildInstructionFrameworkPrompt(
    competitorInfo: string,
    reviewTexts: string,
    additionalContext: string,
    attributeSet: string[],
    context: ICPContext,
    reviewAnalysis?: Record<string, unknown>,
    icpInsights?: Record<string, unknown>,
  ): string {
    return `Analyze the following data using the ${
      context.type
    } attribute set: ${attributeSet.join(', ')}

Competitors:
${competitorInfo}

Customer Reviews:
${reviewTexts}

Additional Context:
${additionalContext}

${
  reviewAnalysis
    ? `
Review Analysis:
- Sentiment: ${
        (reviewAnalysis as Record<string, unknown>).sentimentDistribution &&
        typeof (reviewAnalysis as Record<string, unknown>)
          .sentimentDistribution === 'object'
          ? `${
              (reviewAnalysis as Record<string, unknown>)
                .sentimentDistribution &&
              typeof (reviewAnalysis as Record<string, unknown>)
                .sentimentDistribution === 'object' &&
              (reviewAnalysis as Record<string, unknown>)
                .sentimentDistribution !== null
                ? (
                    (reviewAnalysis as Record<string, unknown>)
                      .sentimentDistribution as Record<string, unknown>
                  )?.positive || 0
                : 0
            } positive, ${
              (reviewAnalysis as Record<string, unknown>)
                .sentimentDistribution &&
              typeof (reviewAnalysis as Record<string, unknown>)
                .sentimentDistribution === 'object' &&
              (reviewAnalysis as Record<string, unknown>)
                .sentimentDistribution !== null
                ? (
                    (reviewAnalysis as Record<string, unknown>)
                      .sentimentDistribution as Record<string, unknown>
                  )?.negative || 0
                : 0
            } negative`
          : 'N/A'
      }
- Pain Points: ${
        (reviewAnalysis as Record<string, unknown>).topPainPoints &&
        Array.isArray((reviewAnalysis as Record<string, unknown>).topPainPoints)
          ? (
              (reviewAnalysis as Record<string, unknown>)
                .topPainPoints as unknown[]
            )
              .slice(0, 3)
              .map(
                (p: unknown) =>
                  (p as Record<string, unknown>)?.point || 'Unknown',
              )
              .join(', ')
          : 'N/A'
      }
- Customer Segments: ${
        (reviewAnalysis as Record<string, unknown>).customerSegments &&
        Array.isArray(
          (reviewAnalysis as Record<string, unknown>).customerSegments,
        )
          ? (
              (reviewAnalysis as Record<string, unknown>)
                .customerSegments as unknown[]
            )
              .slice(0, 3)
              .map(
                (s: unknown) =>
                  (s as Record<string, unknown>)?.segment || 'Unknown',
              )
              .join(', ')
          : 'N/A'
      }
`
    : ''
}

${
  icpInsights
    ? `
ICP Insights:
- Demographics: ${
        Array.isArray(icpInsights.demographics)
          ? icpInsights.demographics.join(', ')
          : 'N/A'
      }
- Psychographics: ${
        Array.isArray(icpInsights.psychographics)
          ? icpInsights.psychographics.join(', ')
          : 'N/A'
      }
- Goals: ${
        Array.isArray(icpInsights.goals) ? icpInsights.goals.join(', ') : 'N/A'
      }
`
    : ''
}

Analyze the data and extract the following ${context.type} attributes:

${
  context.type === 'B2B'
    ? `
B2B Attributes:
- Firmographics: company size, industry, revenue, employee count
- Technographics: technology stack, digital maturity, automation level
- Growth Stage: startup, scale-up, mature
- Decision Making Structure: fast decisions, process-driven, committee-based
- Buying Cycle: quick evaluation, evaluation period, long RFP cycles
- Purchase Motivations: innovation, efficiency, risk mitigation, cost reduction
`
    : `
B2C Attributes:
- Demographics: age, gender, location, income, education
- Psychographics: interests, values, lifestyle, personality
- Behavioral Data: online habits, purchasing behavior, brand preferences
- Triggers: social media trends, sales, expert reviews, emotional appeals
`
}

Respond with JSON containing the extracted attributes and any additional insights for ICP generation.`;
  }

  /**
   * Generate preferred channels based on template and analysis
   */
  private generatePreferredChannelsFromTemplate(
    template: ICPTemplate,
  ): string[] {
    const channels: string[] = [];

    if (template.context === 'B2B') {
      channels.push(
        'LinkedIn',
        'Industry conferences',
        'Trade shows',
        'Email marketing',
      );
      if (template.attributes.firmographics?.companySize === 'Startup') {
        channels.push(
          'Startup events',
          'Angel investor networks',
          'Incubator programs',
        );
      }
      if (template.attributes.firmographics?.companySize === 'Enterprise') {
        channels.push(
          'Executive networks',
          'Industry associations',
          'Consulting partnerships',
        );
      }
    } else {
      channels.push('Social media', 'Email marketing', 'Content marketing');
      if (template.name === 'Trend-Conscious Urbanite') {
        channels.push('Instagram', 'TikTok', 'Influencer partnerships');
      }
      if (template.name === 'Price-Conscious Family') {
        channels.push('Email newsletters', 'Comparison sites', 'Family blogs');
      }
    }

    return channels.slice(0, 6); // Limit to 6 channels
  }

  /*
  private parseICPResponse(responseText: string): ICP[] {
    console.log(`🔍 Parsing LLM response...`);
    console.log(`   📄 Response start: ${responseText.substring(0, 200)}...`);

    try {
      // Try to extract JSON from the response
      let jsonText = responseText;

      // Look for JSON array start and end
      const jsonStart = jsonText.indexOf('[');
      const jsonEnd = jsonText.lastIndexOf(']');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
        console.log(`   📋 JSON found at indexes ${jsonStart}-${jsonEnd}`);
      } else {
        console.warn(`⚠️  JSON array not found, using entire response`);
      }

      // Clean up any extra characters
      jsonText = jsonText.trim();

      // Parse the JSON
      const icps = JSON.parse(jsonText);
      console.log(`✅ JSON parse successful`);

      // Ensure we have an array
      if (Array.isArray(icps)) {
        console.log(`   📊 Array contains ${icps.length} ICP objects`);
        return icps.map((icp: Partial<ICP>) => this.fixICPFields(icp));
      } else if (icps && typeof icps === 'object') {
        // Single ICP object - wrap in array and fix
        console.log(`   📊 Single ICP object, converting to array`);
        return [this.fixICPFields(icps)];
      } else {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error(`❌ JSON parse failed:`);
      console.error(`   🔍 Error:`, parseError);
      console.error(`   📄 Response:`, responseText);

      throw AIServiceErrorFactory.createICPGenerationError(
        'PARSING_FAILED',
        `Failed to parse LLM response as valid JSON: ${
          parseError instanceof Error
            ? parseError.message
            : 'Unknown parsing error'
        }`,
        {
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 500) + '...',
          parseError:
            parseError instanceof Error
              ? parseError.message
              : 'Unknown parsing error',
        },
        parseError instanceof Error ? parseError : undefined,
      );
    }
  }
  */

  /*
  private fixICPFields(icp: Partial<ICP>): ICP {
    return {
      name: icp.name || 'Unknown Profile',
      description: icp.description || 'Profile description',
      demographics: {
        age: icp.demographics?.age || '25-45',
        gender: icp.demographics?.gender || 'Mixed',
        location: icp.demographics?.location || 'Urban areas',
        income: icp.demographics?.income || 'Middle income',
        education: icp.demographics?.education || 'Bachelor degree or higher',
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
          icp.behavior?.purchasingBehavior || 'Research-driven decisions',
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
  }
  */

  /*
  private generatePreferredChannels(icp: Partial<ICP>): string[] {
    const channels: string[] = [];
    const age = icp.demographics?.age || 'Mixed';
    const gender = icp.demographics?.gender || 'Mixed';
    const income = icp.demographics?.income || 'Middle income';
    const interests = icp.psychographics?.interests || [
      'Technology',
      'Business',
    ];

    // Digital channels based on gender and age
    if (
      gender === 'Male' &&
      (age.includes('25-35') || age.includes('35-45')) &&
      income.includes('High income')
    ) {
      channels.push('LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'TikTok');
    } else if (
      gender === 'Female' &&
      (age.includes('30-45') || age.includes('35-55')) &&
      income.includes('Middle income')
    ) {
      channels.push('Pinterest', 'Instagram', 'Facebook', 'Snapchat');
    } else if (gender === 'Mixed' || age.includes('25-35')) {
      channels.push('LinkedIn', 'Facebook', 'Instagram', 'Twitter');
    }

    // Traditional channels based on gender
    if (
      gender === 'Male' &&
      (age.includes('25-35') || age.includes('35-45')) &&
      income.includes('High income')
    ) {
      channels.push('Industry conferences', 'Networking events', 'Trade shows');
    } else if (
      gender === 'Female' &&
      (age.includes('30-45') || age.includes('35-55')) &&
      income.includes('Middle income')
    ) {
      channels.push('Local workshops', 'Meetups', 'Community events');
    } else {
      channels.push('Industry conferences', 'Networking events');
    }

    // Industry-specific channels
    if (interests.includes('Finance') && income.includes('High income')) {
      channels.push('Investment forums', 'Financial blogs');
    } else if (
      interests.includes('Healthcare') &&
      income.includes('High income')
    ) {
      channels.push('Medical conferences', 'Healthcare blogs');
    }

    // Content channels based on gender preferences
    if (gender === 'Male' && income.includes('High income')) {
      channels.push(
        'Business magazines',
        'Financial news websites',
        'Tech blogs',
      );
    } else if (gender === 'Female' && income.includes('Middle income')) {
      channels.push(
        'Lifestyle blogs',
        'Women-focused publications',
        'Community newsletters',
      );
    } else {
      channels.push('Industry publications', 'Blogs', 'Newsletters');
    }

    // Ensure minimum channel diversity
    if (channels.length < 4) {
      channels.push('Email marketing', 'Google Ads', 'Direct mail');
    }

    return channels;
  }
  */

  /*
  private formatDataSourceInfo(dataSources: ApifyDataSource[]): string {
    const sourceInfo = dataSources
      .map((source) => {
        const timestamp = new Date(source.timestamp).toLocaleString();
        return `- ${source.type}: "${source.query}" (${
          source.resultCount
        } results, ${source.location || 'Global'}, ${timestamp})`;
      })
      .join('\n');

    return `Data Sources (Apify Google Maps API):
${sourceInfo}
`;
  }
  */

  private calculateConfidence(
    reviews: CustomerReview[],
    dataSources?: ApifyDataSource[],
  ): 'high' | 'medium' | 'low' {
    const reviewCount = reviews.length;
    const sourceCount = dataSources?.length || 0;
    const totalDataPoints =
      dataSources?.reduce((sum, source) => sum + source.resultCount, 0) ||
      reviewCount;

    // High confidence: 15+ reviews from multiple sources
    if (reviewCount >= 15 && sourceCount >= 2 && totalDataPoints >= 25) {
      return 'high';
    }

    // Medium confidence: 8+ reviews with decent data
    if (reviewCount >= 8 && totalDataPoints >= 12) {
      return 'medium';
    }

    // Low confidence: limited data
    return 'low';
  }

  private extractMarketInsights(
    reviews: CustomerReview[],
    dataSources?: ApifyDataSource[],
  ):
    | { trends: string[]; opportunities: string[]; threats: string[] }
    | undefined {
    // Only provide market insights if we have market data sources
    const hasMarketData = dataSources?.some(
      (source) => source.type === 'apify_market_data',
    );

    if (!hasMarketData) {
      return undefined;
    }

    // Extract basic insights from review patterns
    const trends: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];

    // Analyze review content for patterns
    const allReviewText = reviews.map((r) => r.text.toLowerCase()).join(' ');

    // Trend indicators
    if (allReviewText.includes('digital') || allReviewText.includes('online')) {
      trends.push('Digital transformation demand');
    }
    if (allReviewText.includes('mobile') || allReviewText.includes('app')) {
      trends.push('Mobile-first expectations');
    }
    if (
      allReviewText.includes('sustainable') ||
      allReviewText.includes('environment')
    ) {
      trends.push('Sustainability focus');
    }

    // Opportunity indicators
    if (allReviewText.includes('slow') || allReviewText.includes('delay')) {
      opportunities.push('Speed optimization');
    }
    if (
      allReviewText.includes('expensive') ||
      allReviewText.includes('price')
    ) {
      opportunities.push('Competitive pricing');
    }
    if (
      allReviewText.includes('customer service') ||
      allReviewText.includes('support')
    ) {
      opportunities.push('Enhanced customer support');
    }

    // Threat indicators
    if (
      allReviewText.includes('competitor') ||
      allReviewText.includes('alternative')
    ) {
      threats.push('Increased competition');
    }
    if (allReviewText.includes('outdated') || allReviewText.includes('old')) {
      threats.push('Technology disruption');
    }

    return { trends, opportunities, threats };
  }

  // New method to generate ICPs using centralized company data
  async generateICPFromStoredData(
    competitors: CompetitorData[] = [],
    customerReviews: CustomerReview[] = [],
  ): Promise<ICP[]> {
    try {
      // Get company data from the centralized service
      const companyData = await companyDataService.getCurrentData();
      const progress = await companyDataService.getCompletionProgress();

      // Check if we have enough data to generate ICPs
      if (progress.filled < 5) {
        throw new Error(
          `Need at least 5 fields filled to generate ICPs. Currently have ${progress.filled}/${progress.total} fields filled.`,
        );
      }

      // Use the existing method with the stored data
      return await this.generateICPFromOwnCompany(
        companyData.currentData,
        competitors,
        customerReviews,
      );
    } catch (error) {
      throw AIServiceErrorFactory.createError('ICP_GENERATION_FAILED', {
        message: `Failed to generate ICPs from stored data: ${error}`,
        originalError: error,
      });
    }
  }

  // Method to check if we have enough data for ICP generation
  async canGenerateICPs(): Promise<{
    canGenerate: boolean;
    reason?: string;
    progress: { filled: number; total: number; percentage: number };
  }> {
    try {
      const progress = await companyDataService.getCompletionProgress();
      const canGenerate = progress.filled >= 5;

      return {
        canGenerate,
        reason: canGenerate
          ? undefined
          : `Need at least 5 fields filled. Currently have ${progress.filled}/${progress.total} fields filled.`,
        progress,
      };
    } catch (error) {
      return {
        canGenerate: false,
        reason: `Error checking data: ${error}`,
        progress: { filled: 0, total: 18, percentage: 0 },
      };
    }
  }
}
