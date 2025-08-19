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

    const prompt = `Generate a complete ICP profile for ${
      template.name
    } based on this company data:

Company: ${companyData.name || 'Unknown Company'}
Industry: ${companyData.industry || 'Technology'}
Target Market: ${companyData.targetMarket || 'Businesses'}
Value Proposition: ${companyData.valueProposition || 'Software solutions'}
Main Offerings: ${companyData.mainOfferings || 'Software services'}
Pricing Model: ${companyData.pricingModel || 'Subscription-based'}
Company Size: ${companyData.companySize || 'Small to Medium Business'}
Market Segment: ${companyData.marketSegment || 'B2B'}
Unique Features: ${companyData.uniqueFeatures || 'Innovative technology'}
Competitive Advantages: ${
      companyData.competitiveAdvantages || 'Proven track record'
    }
Current Customers: ${companyData.currentCustomers || 'Various businesses'}
Pain Points Solved: ${
      companyData.painPointsSolved || 'Operational inefficiencies'
    }
Customer Goals: ${
      companyData.customerGoals || 'Improve efficiency and reduce costs'
    }

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
SEGMENTS: Startup Founders, Tech Entrepreneurs, Small Business Owners
PAINS: High operational costs, Limited scalability, Complex compliance requirements
JOBS: Optimize business processes, Scale operations efficiently, Ensure regulatory compliance
OUTCOMES: 30% cost reduction, 50% faster operations, Full compliance assurance
TRIGGERS: Business expansion, Regulatory changes, Cost pressure from competitors
OBJECTIONS: High upfront investment, Implementation complexity, ROI uncertainty
VALUE_PROP: Transform your business operations with our AI-powered platform that reduces costs by 30% while ensuring full compliance.
FEATURES: AI-powered automation, Real-time compliance monitoring, Scalable cloud infrastructure
ADVANTAGES: 10+ years industry experience, 99.9% uptime guarantee, 24/7 expert support
CHANNELS: LinkedIn advertising, Industry conferences, Partner referrals
MESSAGES: "Join 500+ companies saving 30% on operations", "Compliance made simple", "Scale without limits"
CONTENT: Customer success case studies, Industry compliance guides, ROI calculator tools`;

    const systemPrompt = `You are an expert Ideal Customer Profile (ICP) strategist and B2B/B2C market analyst.
Your job is to convert structured company inputs and an ICP template into a COMPLETE, PRACTICAL, and INTERNALLY CONSISTENT ICP.

CRITICAL REQUIREMENTS:
- You MUST generate ALL 12 sections (SEGMENTS, PAINS, JOBS, OUTCOMES, TRIGGERS, OBJECTIONS, VALUE_PROP, FEATURES, ADVANTAGES, CHANNELS, MESSAGES, CONTENT)
- Each section must contain specific, actionable content - NO generic placeholder text
- Base all content on the provided company data and template
- Make reasonable inferences from the company data when specific information is missing

Output policy:
- Language: English only.
- Be specific and practical; avoid generic fluff.
- Use the company's actual offerings, pain points, and value propositions when provided.
- Never output markdown, code fences, tables, or extra commentary.
- Strictly follow the section labels provided by the user prompt.
- For list sections, return 2–4 specific items, comma-separated on a single line.
- Ensure sections align with the business model (B2B/B2C/B2B2C) and the provided template.
- Keep terminology consistent and avoid redundancy across sections.
- The ICP must reflect the actual company's industry, size, offerings, and target market.
- Do not include any headings beyond the required prefixes.

Quality standards:
- PAINS: Must be specific pain points the company actually solves
- JOBS: Must be specific jobs customers hire the company to do
- OUTCOMES: Must be specific, measurable outcomes customers achieve
- VALUE_PROP: Must be a compelling, specific value proposition
- FEATURES: Must be actual unique features of the company's offerings
- ADVANTAGES: Must be real competitive advantages the company has`;

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
      const targetLine = lines.find((line) => line.startsWith(prefix));
      if (!targetLine) return [];
      return targetLine
        .replace(prefix, '')
        .trim()
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    };

    const parseSingleSection = (section: string, prefix: string): string => {
      const lines = section.split('\n');
      const targetLine = lines.find((line) => line.startsWith(prefix));
      if (!targetLine) return '';
      return targetLine.replace(prefix, '').trim();
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

    // Validate that we have all required data
    if (
      segments.length === 0 ||
      pains.length === 0 ||
      jobs.length === 0 ||
      outcomes.length === 0
    ) {
      console.error('❌ ICP generation failed: Missing required sections');
      console.error('Segments:', segments);
      console.error('Pains:', pains);
      console.error('Jobs:', jobs);
      console.error('Outcomes:', outcomes);
      throw new Error(
        'ICP generation failed: AI did not provide all required sections',
      );
    }

    // Create the ICP object with actual AI-generated data
    const icp: ICP = {
      icp_id: icpId,
      icp_name: template.name,
      business_model: businessModel as 'B2B' | 'B2C' | 'B2B2C',
      meta: {
        generated_at: new Date().toISOString(),
        source_company: companyData.name || 'Unknown Company',
      },
      segments: segments,
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
        pains: pains,
        jobs_to_be_done: jobs,
        desired_outcomes: outcomes,
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
