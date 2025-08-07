import type { ICP, CompetitorData, CustomerReview } from './types';
import { OllamaClient } from './ollama-client';

export class ICPGenerator {
  private ollamaClient: OllamaClient;

  constructor() {
    this.ollamaClient = new OllamaClient();
  }

  async generateICPs(
    competitors: CompetitorData[],
    reviews: CustomerReview[],
    additionalContext: string = '',
  ): Promise<ICP[]> {
    console.log(`🎯 Aloitetaan ICP-generaatio:`);
    console.log(`   🏢 Kilpailijoita: ${competitors.length}`);
    console.log(`   📝 Arvosteluja: ${reviews.length}`);
    console.log(`   📋 Lisäkonteksti: ${additionalContext ? 'Kyllä' : 'Ei'}`);

    try {
      const competitorInfo = competitors
        .map((c) => `${c.name} (${c.website})`)
        .join('\n');
      const reviewTexts = reviews.map((r) => r.text).join('\n');

      console.log(`📝 Rakennetaan prompt...`);
      const prompt = this.buildICPPrompt(
        competitorInfo,
        reviewTexts,
        additionalContext,
      );

      console.log(`📤 Lähetetään ICP-generaattoriin...`);
      const startTime = Date.now();
      const responseText = await this.ollamaClient.generateResponse(prompt);
      const endTime = Date.now();

      console.log(`✅ ICP-generaatio valmis:`);
      console.log(`   ⏱️  Kesto: ${endTime - startTime}ms`);
      console.log(`   📊 Vastauksen pituus: ${responseText.length} merkkiä`);

      console.log(`🔍 Parsitaan ICP-vastaus...`);
      const icps = this.parseICPResponse(responseText);

      console.log(`✅ ICP-parsinta valmis:`);
      console.log(`   👥 ICP-profiileja luotu: ${icps.length}`);

      return icps;
    } catch (error) {
      console.error(`❌ ICP-generaatio epäonnistui:`);
      console.error(`   🔍 Virhe:`, error);
      throw error;
    }
  }

  private buildICPPrompt(
    competitorInfo: string,
    reviewTexts: string,
    additionalContext: string,
  ): string {
    return `Create 3 Ideal Customer Profile (ICP) profiles based on the following data:

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

IMPORTANT AGE ANALYSIS INSTRUCTIONS:
- Analyze the review data for age indicators (language complexity, cultural references, technology usage)
- Consider writing style, formality, and life stage indicators
- Look for student indicators (opiskelija, yliopisto, koulu) → 18-25 age range
- Look for young professional indicators (työ, ura, asunto) → 25-35 age range
- Look for family indicators (perhe, lapsi, asunto) → 30-50 age range
- Look for senior indicators (eläke, terveys, lapsenlapsi) → 55+ age range
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
    console.log(`🔍 Parsitaan LLM-vastaus...`);
    console.log(`   📄 Vastauksen alku: ${responseText.substring(0, 200)}...`);

    try {
      // Try to extract JSON from the response
      let jsonText = responseText;

      // Look for JSON array start and end
      const jsonStart = jsonText.indexOf('[');
      const jsonEnd = jsonText.lastIndexOf(']');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
        console.log(`   📋 JSON löydetty indekseistä ${jsonStart}-${jsonEnd}`);
      } else {
        console.warn(`⚠️  JSON-arraya ei löytynyt, käytetään koko vastausta`);
      }

      // Clean up any extra characters
      jsonText = jsonText.trim();

      // Parse the JSON
      const icps = JSON.parse(jsonText);
      console.log(`✅ JSON-parsinta onnistui`);

      // Ensure we have an array
      if (Array.isArray(icps)) {
        console.log(`   📊 Array sisältää ${icps.length} ICP-objektia`);
        return icps.map((icp: Partial<ICP>) => this.fixICPFields(icp));
      } else if (icps && typeof icps === 'object') {
        // Single ICP object - wrap in array and fix
        console.log(`   📊 Yksi ICP-objekti, muutetaan arrayksi`);
        return [this.fixICPFields(icps)];
      } else {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error(`❌ JSON-parsinta epäonnistui:`);
      console.error(`   🔍 Virhe:`, parseError);
      console.error(`   📄 Vastaus:`, responseText);
      console.log(`🔄 Käytetään fallback-ICP:tä...`);
      return this.getFallbackICPs();
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

  private getFallbackICPs(): ICP[] {
    return [
      {
        name: 'Default ICP Profile',
        description: 'Generated based on competitor analysis',
        demographics: {
          age: '25-35',
          gender: 'Mixed',
          location: 'Urban areas',
          income: 'Middle income',
          education: 'Bachelor degree or higher',
        },
        psychographics: {
          interests: ['Technology', 'Business', 'Innovation'],
          values: ['Quality', 'Efficiency', 'Growth'],
          lifestyle: 'Busy professionals',
          painPoints: ['Time constraints', 'Complex solutions', 'High costs'],
        },
        behavior: {
          onlineHabits: ['Social media', 'Professional networks'],
          purchasingBehavior: 'Research-driven decisions',
          brandPreferences: ['Established brands', 'Innovative companies'],
        },
        goals: ['Business growth', 'Efficiency improvement', 'Cost reduction'],
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
      {
        name: 'Female Professional ICP',
        description: 'Female professional customer profile',
        demographics: {
          age: '30-45',
          gender: 'Female',
          location: 'Urban areas',
          income: 'Middle to High income',
          education: 'Bachelor degree or higher',
        },
        psychographics: {
          interests: ['Business', 'Technology', 'Professional development'],
          values: ['Quality', 'Work-life balance', 'Growth'],
          lifestyle: 'Professional women',
          painPoints: [
            'Time management',
            'Work-life balance',
            'Professional advancement',
          ],
        },
        behavior: {
          onlineHabits: ['LinkedIn', 'Professional networks', 'Social media'],
          purchasingBehavior: 'Research-driven, value-conscious',
          brandPreferences: ['Established brands', 'Professional services'],
        },
        goals: [
          'Career advancement',
          'Work-life balance',
          'Professional development',
        ],
        challenges: [
          'Time constraints',
          'Professional recognition',
          'Work-life integration',
        ],
        preferredChannels: [
          'LinkedIn',
          'Professional women networks',
          'Industry conferences',
          'Email marketing',
          'Women-focused publications',
          'Professional workshops',
        ],
      },
      {
        name: 'Male Executive ICP',
        description: 'Male executive customer profile',
        demographics: {
          age: '35-55',
          gender: 'Male',
          location: 'Urban areas',
          income: 'High income',
          education: 'Advanced degree',
        },
        psychographics: {
          interests: ['Business', 'Technology', 'Leadership'],
          values: ['Efficiency', 'Growth', 'Innovation'],
          lifestyle: 'Busy executives',
          painPoints: [
            'Time efficiency',
            'Complex decision making',
            'High expectations',
          ],
        },
        behavior: {
          onlineHabits: ['LinkedIn', 'Professional networks', 'Business news'],
          purchasingBehavior: 'Decision-maker, ROI-focused',
          brandPreferences: ['Premium brands', 'Innovative solutions'],
        },
        goals: [
          'Business growth',
          'Operational efficiency',
          'Market leadership',
        ],
        challenges: [
          'Complex solutions',
          'Implementation time',
          'ROI measurement',
        ],
        preferredChannels: [
          'LinkedIn',
          'Industry conferences',
          'Executive networks',
          'Business publications',
          'Trade shows',
          'Professional associations',
        ],
      },
    ];
  }
}
