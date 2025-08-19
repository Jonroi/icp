import type { ICP } from '../../types';
import type { ICPTemplate } from '../templates';
import { OllamaClient } from '../../ollama-client';

export class ICPBuilder {
  private ollamaClient: OllamaClient;

  constructor() {
    this.ollamaClient = OllamaClient.getInstance();
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

Template: ${template.name} - ${template.description}

Generate the following in a single response, separated by "---":

SEGMENTS: 2-3 customer segments (comma-separated)
PAINS: 3-4 pain points (comma-separated)  
JOBS: 3-4 jobs to be done (comma-separated)
OUTCOMES: 3-4 desired outcomes (comma-separated)
TRIGGERS: 3-4 buying triggers (comma-separated)
OBJECTIONS: 3-4 common objections (comma-separated)
VALUE_PROP: 1 sentence value proposition
FEATURES: 3 unique features (comma-separated)
ADVANTAGES: 3 competitive advantages (comma-separated)
CHANNELS: 3 go-to-market channels (comma-separated)
MESSAGES: 3 key messages (comma-separated)
CONTENT: 3 content ideas (comma-separated)

Example format:
SEGMENTS: Startup Founders, Tech Entrepreneurs, Small Business Owners
PAINS: High operational costs, Limited scalability, Complex compliance
---`;

    const systemPrompt = `You are an expert Ideal Customer Profile (ICP) strategist and B2B/B2C market analyst.
Your job is to convert structured company inputs and an ICP template into a COMPLETE, PRACTICAL, and INTERNALLY CONSISTENT ICP.

Output policy:
- Language: English only.
- Be specific and practical; avoid fluff.
- Make reasonable domain-consistent inferences when data is missing; do not contradict provided inputs.
- Never output markdown, code fences, tables, or extra commentary.
- Strictly follow the section labels provided by the user prompt (SEGMENTS, PAINS, JOBS, OUTCOMES, TRIGGERS, OBJECTIONS, VALUE_PROP, FEATURES, ADVANTAGES, CHANNELS, MESSAGES, CONTENT).
- For list sections, return 2–4 items, comma-separated on a single line.
- Ensure sections align with the business model (B2B/B2C/B2B2C) and the provided template.
- Keep terminology consistent (e.g., segments, triggers, objections) and avoid redundancy across sections.
- The ICP must reflect: industry, company size, geography hints, pains, jobs-to-be-done, outcomes, value prop alignment, buying triggers, objections, go-to-market hints, and fit scoring themes.
- Do not include any headings beyond the required prefixes.
`;

    const response = await this.ollamaClient.generateResponse(
      prompt,
      systemPrompt,
    );

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

    // Create the ICP object
    const icp: ICP = {
      icp_id: icpId,
      icp_name: template.name,
      business_model: businessModel as 'B2B' | 'B2C' | 'B2B2C',
      meta: {
        generated_at: new Date().toISOString(),
        source_company: companyData.name || 'Unknown Company',
      },
      segments:
        segments.length > 0
          ? segments
          : ['Business Professionals', 'Industry Leaders'],
      fit_definition: {
        company_attributes: {
          industries: [companyData.industry || 'Technology'],
          company_sizes: ['Small Business', 'Medium Business'],
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
        pains:
          pains.length > 0
            ? pains
            : ['Operational inefficiency', 'High costs', 'Complex processes'],
        jobs_to_be_done:
          jobs.length > 0
            ? jobs
            : ['Optimize operations', 'Reduce costs', 'Improve efficiency'],
        desired_outcomes:
          outcomes.length > 0
            ? outcomes
            : ['Increased efficiency', 'Cost savings', 'Better performance'],
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
