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

export class ICPGenerator {
  private ollamaClient: OllamaClient;

  constructor() {
    this.ollamaClient = OllamaClient.getInstance();
  }

  async generateICPs(
    competitors: CompetitorData[],
    reviews: CustomerReview[],
    additionalContext: string = '',
  ): Promise<ICP[]> {
    return this.generateApifyBasedICPs(competitors, reviews, additionalContext);
  }

  /**
   * Enhanced ICP generation that returns Apify-based ICPs with data source tracking
   */
  async generateApifyBasedICPs(
    competitors: CompetitorData[],
    reviews: CustomerReview[],
    additionalContext: string = '',
    dataSources?: ApifyDataSource[],
  ): Promise<ApifyBasedICP[]> {
    console.log(`🎯 Starting Apify-based ICP generation:`);
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
      const competitorInfo = competitors
        .map((c) => `${c.name} (${c.website})`)
        .join('\n');
      const reviewTexts = reviews.map((r) => r.text).join('\n');

      // Enhanced review analysis using ReviewAnalyzer
      console.log(`🔍 Analyzing reviews for ICP insights...`);
      const reviewAnalysis = ReviewAnalyzer.analyzeBatch(reviews);
      const icpInsights = ReviewAnalyzer.extractICPInsights(reviews);

      console.log(`📊 Review analysis completed:`);
      console.log(
        `   📈 Sentiment: ${reviewAnalysis.sentimentDistribution.positive} positive, ${reviewAnalysis.sentimentDistribution.negative} negative`,
      );
      console.log(
        `   🎯 Top pain points: ${reviewAnalysis.topPainPoints
          .slice(0, 3)
          .map((p) => p.point)
          .join(', ')}`,
      );
      console.log(
        `   👥 Customer segments: ${reviewAnalysis.customerSegments
          .slice(0, 3)
          .map((s) => s.segment)
          .join(', ')}`,
      );

      console.log(`📝 Building enhanced prompt...`);
      const prompt = this.buildApifyEnhancedICPPrompt(
        competitorInfo,
        reviewTexts,
        additionalContext,
        dataSources,
        reviewAnalysis,
        icpInsights,
      );

      console.log(`📤 Sending to ICP generator...`);
      const startTime = Date.now();
      const responseText = await this.ollamaClient.generateResponse(prompt);
      const endTime = Date.now();

      console.log(`✅ ICP generation completed:`);
      console.log(`   ⏱️  Duration: ${endTime - startTime}ms`);
      console.log(`   📊 Response length: ${responseText.length} chars`);

      if (!responseText || responseText.trim().length === 0) {
        throw AIServiceErrorFactory.createICPGenerationError(
          'LLM_UNAVAILABLE',
          'LLM returned empty response. Please check that Ollama is running and the model is available.',
          { prompt: prompt.substring(0, 200) + '...' },
        );
      }

      console.log(`🔍 Parsing ICP response...`);
      const icps = this.parseICPResponse(responseText);

      console.log(`✅ ICP parsing finished:`);
      console.log(`   👥 ICP profiles created: ${icps.length}`);

      if (icps.length === 0) {
        throw AIServiceErrorFactory.createICPGenerationError(
          'PARSING_FAILED',
          'Failed to parse any valid ICPs from LLM response',
          {
            responseLength: responseText.length,
            responsePreview: responseText.substring(0, 500) + '...',
          },
        );
      }

      // Convert to ApifyBasedICP format with data source tracking
      const apifyBasedICPs: ApifyBasedICP[] = icps.map((icp) => ({
        ...icp,
        dataSources: dataSources || [],
        confidence: this.calculateConfidence(reviews, dataSources),
        marketInsights: this.extractMarketInsights(reviews, dataSources),
      }));

      return apifyBasedICPs;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        // Re-throw our custom errors
        throw error;
      }

      console.error(`❌ ICP generation failed:`);
      console.error(`   🔍 Error:`, error);
      throw AIServiceErrorFactory.createICPGenerationError(
        'ICP_GENERATION_FAILED',
        `ICP generation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        {
          competitorCount: competitors.length,
          reviewCount: reviews.length,
          hasAdditionalContext: additionalContext.length > 0,
        },
        error instanceof Error ? error : undefined,
      );
    }
  }

  private buildApifyEnhancedICPPrompt(
    competitorInfo: string,
    reviewTexts: string,
    additionalContext: string,
    dataSources?: ApifyDataSource[],
    reviewAnalysis?: any,
    icpInsights?: any,
  ): string {
    const dataSourceInfo = dataSources?.length
      ? this.formatDataSourceInfo(dataSources)
      : '';

    return `Create 3 Ideal Customer Profile (ICP) profiles based on the following Apify Google Maps collected data. This data comes from structured Google Maps reviews, providing high-quality customer insights.

${dataSourceInfo}

Competitors:
${competitorInfo}

Customer Reviews & Market Data (from Apify Google Maps):
${reviewTexts}

${
  reviewAnalysis
    ? `
ENHANCED REVIEW ANALYSIS:
Sentiment Distribution: ${
        reviewAnalysis.sentimentDistribution.positive
      } positive, ${reviewAnalysis.sentimentDistribution.negative} negative, ${
        reviewAnalysis.sentimentDistribution.neutral
      } neutral
Average Rating: ${reviewAnalysis.averageRating.toFixed(1)}/5
Top Pain Points: ${reviewAnalysis.topPainPoints
        .slice(0, 5)
        .map((p) => p.point)
        .join(', ')}
Customer Segments: ${reviewAnalysis.customerSegments
        .slice(0, 5)
        .map((s) => s.segment)
        .join(', ')}
Common Topics: ${reviewAnalysis.commonTopics
        .slice(0, 5)
        .map((t) => t.topic)
        .join(', ')}
Emotional Trends: ${reviewAnalysis.emotionalTrends
        .slice(0, 3)
        .map((e) => e.emotion)
        .join(', ')}
`
    : ''
}

${
  icpInsights
    ? `
ICP-RELEVANT INSIGHTS:
Demographics: ${icpInsights.demographics.join(', ')}
Psychographics: ${icpInsights.psychographics.join(', ')}
Pain Points: ${icpInsights.painPoints.slice(0, 5).join(', ')}
Goals: ${icpInsights.goals.join(', ')}
Preferred Channels: ${icpInsights.preferredChannels.join(', ')}
Purchasing Behavior: ${icpInsights.purchasingBehavior.join(', ')}
`
    : ''
}

Additional Context:
${additionalContext}

IMPORTANT: This data was collected via Apify Google Maps API, ensuring accuracy and relevance. Use this structured data to create precise customer profiles.

Respond ONLY with valid JSON array containing exactly 3 ICP objects. Each ICP must have this exact structure:

[
  {
    "name": "Profile name",
    "description": "A short, marketing-friendly paragraph summarizing who they are, what they care about, and why they buy",
    "demographics": {
      "age": "Age range (e.g., 25-35, 35-45, 45-55, 55+)",
      "gender": "Male, Female, or Mixed (based on review data patterns)",
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

Apify Google Maps-Enhanced Analysis Instructions:
- Leverage the structured Google Maps data to identify authentic customer patterns
- Use platform-specific insights (Google Maps reviews) to understand channel preferences
- Extract demographic signals from review language and context
- Identify pain points from actual customer complaints and feedback
- Use Google Maps data to validate trends and opportunities

IMPORTANT AGE ANALYSIS INSTRUCTIONS:
- Analyze the review data for age indicators (language complexity, cultural references, technology usage)
- Consider writing style, formality, and life stage indicators
- Look for student indicators (student, university, school) → 18-25 age range
- Look for young professional indicators (work, career, apartment) → 25-35 age range
- Look for family indicators (family, child, apartment) → 30-50 age range
- Look for senior indicators (retirement, health, grandchildren) → 55+ age range
- Use specific age ranges like "25-35", "35-45", "45-55", "55+" rather than vague descriptions

IMPORTANT GENDER ANALYSIS INSTRUCTIONS:
- Analyze the review data for gender indicators (names, pronouns, context)
- If reviews show clear male patterns (male names, male-oriented language), use "Male"
- If reviews show clear female patterns (female names, female-oriented language), use "Female"
- If mixed or unclear patterns, use "Mixed"
- Consider Finnish names and cultural context in the reviews

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
  }

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
}
