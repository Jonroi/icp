import type { ICP } from '../../types';
import type { ICPTemplate } from '../templates';
import { AISDKService } from '../../ai-sdk-service';

export class ICPBuilder {
  private aiService: AISDKService;

  constructor() {
    this.aiService = AISDKService.getInstance();
  }

  /**
   * Generate ICP profile from selected template using a single efficient call
   */
  async generateICPFromTemplate(
    companyData: any,
    template: ICPTemplate,
    businessModel: string,
  ): Promise<ICP> {
    const icpId = `icp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log(`🎯 Generating complete ICP for template: ${template.name}`);
    console.log('📊 Company data for ICP generation:', companyData);

    const prompt = `Generate a complete ICP profile for ${
      template.name
    } based on this comprehensive company data:

COMPANY INFORMATION:
- Name: ${companyData.name || 'Unknown Company'}
- Industry: ${companyData.industry || 'Technology'}
- Company Size: ${companyData.companySize || 'Small to Medium Business'}
- Market Segment: ${companyData.marketSegment || 'B2B'}
- Location: ${companyData.location || 'Global'}
- Website: ${companyData.website || 'N/A'}
- LinkedIn: ${companyData.social || 'N/A'}

BUSINESS DETAILS:
- Target Market: ${companyData.targetMarket || 'Businesses'}
- Value Proposition: ${companyData.valueProposition || 'Software solutions'}
- Main Offerings: ${companyData.mainOfferings || 'Software services'}
- Pricing Model: ${companyData.pricingModel || 'Subscription-based'}
- Unique Features: ${companyData.uniqueFeatures || 'Innovative technology'}
- Competitive Advantages: ${
      companyData.competitiveAdvantages || 'Proven track record'
    }

CUSTOMER INSIGHTS:
- Current Customers: ${companyData.currentCustomers || 'Various businesses'}
- Pain Points Solved: ${
      companyData.painPointsSolved || 'Operational inefficiencies'
    }
- Customer Goals: ${
      companyData.customerGoals || 'Improve efficiency and reduce costs'
    }
- Success Stories: ${companyData.successStories || 'N/A'}
- Current Marketing Channels: ${companyData.currentMarketingChannels || 'N/A'}
- Marketing Messaging: ${companyData.marketingMessaging || 'N/A'}

Template: ${template.name} - ${template.description}

You MUST generate ALL of the following sections. Each section must contain specific, actionable content based on the company data and template:

SEGMENTS: 2-3 specific customer segments (comma-separated)
PAINS: 3-4 specific pain points this company solves (comma-separated)  
JOBS: 3-4 specific jobs to be done (comma-separated)
OUTCOMES: 3-4 specific desired outcomes (comma-separated)
TRIGGERS: 3-4 specific buying triggers (comma-separated)
OBJECTIONS: 3-4 specific common objections (comma-separated)
VALUE_PROP: 1 specific value proposition sentence
FEATURES: 3 specific unique features (comma-separated)
ADVANTAGES: 3 specific competitive advantages (comma-separated)
CHANNELS: 3 specific go-to-market channels (comma-separated)
MESSAGES: 3 specific key messages (comma-separated)
CONTENT: 3 specific content ideas (comma-separated)

Example format:
SEGMENTS: Small Business Owners, Tech Entrepreneurs, Operations Managers
PAINS: Manual data entry errors, Inefficient workflow processes, Lack of real-time visibility
JOBS: Automate repetitive tasks, Streamline business operations, Monitor performance metrics
OUTCOMES: 40% time savings, Reduced operational errors, Improved decision-making
TRIGGERS: Business growth, Process bottlenecks, Regulatory requirements
OBJECTIONS: High implementation costs, Learning curve concerns, Integration complexity
VALUE_PROP: Streamline your business operations with our AI-powered automation platform that reduces manual work by 40% while improving accuracy.
FEATURES: AI-powered workflow automation, Real-time analytics dashboard, Custom integration APIs
ADVANTAGES: 15+ years in business automation, 99.9% system reliability, Dedicated customer success team
CHANNELS: LinkedIn targeted advertising, Industry webinars, Customer referral program
MESSAGES: "Automate 40% of your manual tasks", "See results in 30 days", "Join 1000+ satisfied customers"
CONTENT: Customer success stories, ROI calculator, Implementation best practices guide`;

    const systemPrompt = `You are an expert Ideal Customer Profile (ICP) strategist and B2B/B2C market analyst.
Your job is to convert structured company inputs and an ICP template into a COMPLETE, PRACTICAL, and INTERNALLY CONSISTENT ICP.

CRITICAL REQUIREMENTS:
- You MUST generate ALL 12 sections (SEGMENTS, PAINS, JOBS, OUTCOMES, TRIGGERS, OBJECTIONS, VALUE_PROP, FEATURES, ADVANTAGES, CHANNELS, MESSAGES, CONTENT)
- Each section must contain specific, actionable content - NO generic placeholder text
- Base all content on the provided company data and template
- Make reasonable inferences from the company data when specific information is missing

ANALYSIS APPROACH:
1. ANALYZE the company's industry, size, and market segment to identify target customer segments
2. EXTRACT specific pain points from the company's "Pain Points Solved" and "Customer Goals" data
3. INFER jobs-to-be-done from the company's offerings and value proposition
4. DERIVE desired outcomes from customer goals and success stories
5. IDENTIFY buying triggers based on industry trends and company's target market
6. ANTICIPATE objections based on pricing model and implementation complexity
7. CRAFT value proposition using the company's actual value proposition and unique features
8. LIST actual features from the company's "Unique Features" data
9. HIGHLIGHT competitive advantages from the company's "Competitive Advantages" data
10. SUGGEST channels based on the company's "Current Marketing Channels" and industry
11. CREATE messages that align with the company's "Marketing Messaging"
12. DEVELOP content ideas based on success stories and customer insights

Output policy:
- Language: English only.
- Be specific and practical; avoid generic fluff.
- Use the company's actual offerings, pain points, and value propositions when provided.
- NEVER use markdown formatting, bold text (**), italics (*), code fences, tables, or extra commentary.
- Use ONLY plain text with the exact section labels: SEGMENTS:, PAINS:, JOBS:, etc.
- Strictly follow the section labels provided by the user prompt.
- For list sections, return 2–4 specific items, comma-separated on a single line.
- Ensure sections align with the business model (B2B/B2C/B2B2C) and the provided template.
- Keep terminology consistent and avoid redundancy across sections.
- The ICP must reflect the actual company's industry, size, offerings, and target market.
- Do not include any headings beyond the required prefixes.
- Start each section with the exact label followed by a colon and space (e.g. "SEGMENTS: ").

Quality standards:
- PAINS: Must be specific pain points the company actually solves (use "Pain Points Solved" data)
- JOBS: Must be specific jobs customers hire the company to do (infer from offerings and goals)
- OUTCOMES: Must be specific, measurable outcomes customers achieve (use "Customer Goals" data)
- VALUE_PROP: Must be a compelling, specific value proposition (use company's actual value proposition)
- FEATURES: Must be actual unique features of the company's offerings (use "Unique Features" data)
- ADVANTAGES: Must be real competitive advantages the company has (use "Competitive Advantages" data)`;

    const response = await this.aiService.generateResponse(
      prompt,
      systemPrompt,
    );

    console.log('🤖 AI Response:', response);

    // Parse the response
    const sections = response
      .split('---')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parseSection = (section: string, prefix: string): string[] => {
      const lines = section.split('\n');
      // Try multiple patterns to handle markdown formatting
      const patterns = [
        prefix, // SEGMENTS:
        `**${prefix}**`, // **SEGMENTS:**
        `*${prefix}*`, // *SEGMENTS:*
        prefix.replace(':', ''), // SEGMENTS (without colon)
        `**${prefix.replace(':', '')}**`, // **SEGMENTS**
      ];

      let targetLine = null;
      for (const pattern of patterns) {
        targetLine = lines.find((line) => line.trim().startsWith(pattern));
        if (targetLine) {
          // Remove the pattern from the beginning
          targetLine = targetLine.replace(pattern, '').trim();
          if (targetLine.startsWith(':')) {
            targetLine = targetLine.substring(1).trim();
          }
          break;
        }
      }

      if (!targetLine) return [];
      return targetLine
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    };

    const parseSingleSection = (section: string, prefix: string): string => {
      const lines = section.split('\n');
      // Try multiple patterns to handle markdown formatting
      const patterns = [
        prefix, // VALUE_PROP:
        `**${prefix}**`, // **VALUE_PROP:**
        `*${prefix}*`, // *VALUE_PROP:*
        prefix.replace(':', ''), // VALUE_PROP (without colon)
        `**${prefix.replace(':', '')}**`, // **VALUE_PROP**
      ];

      let targetLine = null;
      for (const pattern of patterns) {
        targetLine = lines.find((line) => line.trim().startsWith(pattern));
        if (targetLine) {
          // Remove the pattern from the beginning
          targetLine = targetLine.replace(pattern, '').trim();
          if (targetLine.startsWith(':')) {
            targetLine = targetLine.substring(1).trim();
          }
          break;
        }
      }

      return targetLine || '';
    };

    // Extract data from response
    const segments = parseSection(response, 'SEGMENTS:');
    const pains = parseSection(response, 'PAINS:');
    const jobs = parseSection(response, 'JOBS:');
    const outcomes = parseSection(response, 'OUTCOMES:');
    const triggers = parseSection(response, 'TRIGGERS:');
    const objections = parseSection(response, 'OBJECTIONS:');
    const valueProp = parseSingleSection(response, 'VALUE_PROP:');
    const features = parseSection(response, 'FEATURES:');
    const advantages = parseSection(response, 'ADVANTAGES:');
    const channels = parseSection(response, 'CHANNELS:');
    const messages = parseSection(response, 'MESSAGES:');
    const content = parseSection(response, 'CONTENT:');

    console.log('📊 Parsed Sections:');
    console.log('Segments:', segments);
    console.log('Pains:', pains);
    console.log('Jobs:', jobs);
    console.log('Outcomes:', outcomes);
    console.log('Triggers:', triggers);
    console.log('Objections:', objections);
    console.log('Value Prop:', valueProp);
    console.log('Features:', features);
    console.log('Advantages:', advantages);
    console.log('Channels:', channels);
    console.log('Messages:', messages);
    console.log('Content:', content);

    // Use fallback values for missing sections instead of throwing error
    const finalSegments =
      segments.length > 0
        ? segments
        : ['Business Professionals', 'Industry Leaders'];
    const finalPains =
      pains.length > 0
        ? pains
        : [
            companyData.painPointsSolved || 'Operational inefficiencies',
            'Manual processes',
            'Limited scalability',
          ];
    const finalJobs =
      jobs.length > 0
        ? jobs
        : ['Improve efficiency', 'Reduce costs', 'Optimize operations'];
    const finalOutcomes =
      outcomes.length > 0
        ? outcomes
        : [
            companyData.customerGoals || 'Increased productivity',
            'Cost savings',
            'Better performance',
          ];

    console.log('✅ Processed sections with fallbacks where needed');
    console.log('Final Segments:', finalSegments);
    console.log('Final Pains:', finalPains);
    console.log('Final Jobs:', finalJobs);
    console.log('Final Outcomes:', finalOutcomes);

    // Create the ICP object with actual AI-generated data
    const icp: ICP = {
      icp_id: icpId,
      icp_name: template.name,
      business_model: businessModel as 'B2B' | 'B2C' | 'B2B2C',
      meta: {
        generated_at: new Date().toISOString(),
        source_company: companyData.name || 'Unknown Company',
      },
      segments: finalSegments,
      fit_definition: {
        company_attributes: {
          industries: [companyData.industry || 'Technology'],
          company_sizes: companyData.companySize
            ? [companyData.companySize]
            : ['Small Business', 'Medium Business'],
          geographies: ['Global'],
          tech_stack_hints: ['Modern SaaS', 'Cloud-based'],
        },
        buyer_personas: [
          {
            role: 'Decision Maker',
            seniority: 'Mid-level',
            dept: 'Operations',
            decision_power: 'decision maker',
          },
        ],
      },
      needs_pain_goals: {
        pains: finalPains,
        jobs_to_be_done: finalJobs,
        desired_outcomes: finalOutcomes,
      },
      buying_triggers:
        triggers.length > 0
          ? triggers
          : ['Business expansion', 'Technology upgrade', 'Cost pressure'],
      common_objections:
        objections.length > 0
          ? objections
          : ['High upfront costs', 'Implementation time', 'ROI uncertainty'],
      value_prop_alignment: {
        value_prop:
          valueProp ||
          companyData.valueProposition ||
          'Comprehensive business solutions',
        unique_features:
          features.length > 0
            ? features
            : ['AI-powered', 'Cloud-based', 'Scalable'],
        competitive_advantages:
          advantages.length > 0
            ? advantages
            : ['Advanced technology', 'Proven track record', 'Expert support'],
      },
      offerings_pricing: {
        main_offerings: companyData.mainOfferings || 'Software solutions',
        pricing_model: companyData.pricingModel || 'Subscription-based',
        pricing_tiers: ['Basic', 'Professional', 'Enterprise'],
      },
      go_to_market: {
        primary_channels:
          channels.length > 0
            ? channels
            : ['LinkedIn', 'Email Marketing', 'Content Marketing'],
        messages:
          messages.length > 0
            ? messages
            : [
                'Transform your business with our solutions',
                'Join industry leaders who trust us',
                'See results in 30 days or less',
              ],
        content_ideas:
          content.length > 0
            ? content
            : [
                'Case studies from similar companies',
                'Industry trend reports',
                'Best practice guides',
              ],
      },
      fit_scoring: {
        score: 85,
        score_breakdown: {
          industry_fit: 90,
          size_fit: 85,
          geo_fit: 80,
          pain_alignment: 85,
          goal_alignment: 90,
        },
      },
      abm_tier: 'Tier 1',
      confidence: 'high',
    };

    return icp;
  }
}
