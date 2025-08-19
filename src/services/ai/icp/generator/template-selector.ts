import type { ICPTemplate } from '../templates';
import { ICP_TEMPLATES } from '../templates';
import { AISDKService } from '../../core/ai-sdk-service';

export class TemplateSelector {
  private aiService: AISDKService;

  constructor() {
    this.aiService = AISDKService.getInstance();
  }

  /**
   * Select the 3 best-fitting ICP templates from dozens of options based on company data
   */
  async selectBestFittingTemplates(
    companyData: any,
    businessModel: string,
  ): Promise<ICPTemplate[]> {
    const availableTemplates =
      ICP_TEMPLATES[businessModel as keyof typeof ICP_TEMPLATES] || [];

    // Group templates by category for better analysis
    const templatesByCategory = availableTemplates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as Record<string, ICPTemplate[]>);

    // Map category names to English
    const categoryLabels: Record<string, string> = {
      startup: 'STARTUP COMPANIES',
      smb: 'SMALL-MEDIUM BUSINESSES',
      mid_market: 'MID-MARKET COMPANIES',
      enterprise: 'ENTERPRISE COMPANIES',
      healthcare: 'HEALTHCARE INDUSTRY',
      financial: 'FINANCIAL SERVICES',
      manufacturing: 'MANUFACTURING',
      retail: 'RETAIL',
      logistics: 'LOGISTICS & TRANSPORTATION',
      real_estate: 'REAL ESTATE',
      legal: 'LEGAL SERVICES',
      consulting: 'CONSULTING',
      media: 'MEDIA & ENTERTAINMENT',
      education: 'EDUCATION',
      demographics: 'DEMOGRAPHIC SEGMENTS',
      lifestyle: 'LIFESTYLE SEGMENTS',
      behavior: 'BEHAVIORAL SEGMENTS',
      specialized: 'SPECIALIZED SEGMENTS',
      platform: 'PLATFORM PARTNERS',
      hybrid: 'HYBRID BUSINESSES',
    };

    const prompt = `Analyze this company data and select the 3 BEST-FITTING ICP templates from ${
      availableTemplates.length
    } available options.

Company Data:
${this.formatCompanyData(companyData)}

Business Model: ${businessModel}

Available ICP Templates (${availableTemplates.length} total):
${Object.entries(templatesByCategory)
  .map(
    ([category, templates]) =>
      `${categoryLabels[category] || category.toUpperCase()} (${
        templates.length
      } options):\n${templates
        .map(
          (t) =>
            `- ID: "${t.id}" | Name: ${t.name} | Description: ${t.description}`,
        )
        .join('\n')}`,
  )
  .join('\n\n')}

Selection Criteria:
1. Industry Alignment: How well does the template match the company's industry?
2. Company Size Fit: Does the template match the company's size (startup/SMB/mid-market/enterprise)?
3. Target Market Match: Does the template align with the company's target market?
4. Value Proposition Alignment: Does the template fit the company's value proposition?
5. Business Model Compatibility: Does the template work with the company's business model?
6. Market Segment Relevance: Does the template match the company's market segment?

Analyze the company data carefully and select exactly 3 templates that would be MOST RELEVANT and ACTIONABLE for this specific company.

IMPORTANT: 
1. Respond with ONLY a JSON array of template IDs, no explanations or additional text
2. Use ONLY the exact template IDs listed above (e.g., "startup_innovator", "smb_optimizer", "tech_startup")
3. Do NOT create new template IDs or use descriptive names

Example: ["startup_innovator", "tech_startup", "saas_startup"]
`;

    const response = await this.aiService.generateResponse(prompt);

    // Extract JSON from response - be more specific to avoid capturing too much
    const jsonMatch = response.match(/\[[\s\S]*?\]/);

    try {
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      let jsonStr = jsonMatch[0];

      // Clean up common LLM response artifacts
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      jsonStr = jsonStr.replace(/^- /gm, ''); // Remove bullet points
      jsonStr = jsonStr.replace(/^`/g, '').replace(/`$/g, ''); // Remove backticks
      jsonStr = jsonStr.trim();

      const selectedIds = JSON.parse(jsonStr) as string[];

      // Map IDs back to template objects
      const selectedTemplates = selectedIds
        .map((id) => availableTemplates.find((t) => t.id === id))
        .filter((t): t is ICPTemplate => t !== undefined);

      // Ensure we have exactly 3 templates
      if (selectedTemplates.length < 3) {
        const remaining = availableTemplates.filter(
          (t) => !selectedTemplates.some((st) => st?.id === t.id),
        );
        selectedTemplates.push(
          ...remaining.slice(0, 3 - selectedTemplates.length),
        );
      }

      console.log(
        `🎯 Selected ICP templates: ${selectedTemplates
          .map((t) => t?.name || 'Unknown')
          .join(', ')}`,
      );
      return selectedTemplates.slice(0, 3);
    } catch (error) {
      console.error('Failed to parse template selection:', error);
      console.error('Raw response:', response);
      console.error(
        'Attempted to extract JSON from:',
        jsonMatch ? jsonMatch[0] : 'No match found',
      );
      throw new Error(
        `Failed to parse template selection: ${
          error instanceof Error ? error.message : 'Unknown error'
        }. Raw response: ${response.substring(0, 200)}...`,
      );
    }
  }

  /**
   * Format company data for LLM prompt
   */
  private formatCompanyData(companyData: any): string {
    const fields = [
      'name',
      'industry',
      'targetMarket',
      'valueProposition',
      'mainOfferings',
      'pricingModel',
      'marketSegment',
      'companySize',
      'location',
    ];

    return fields
      .map((field) => {
        const value = companyData[field];
        return value ? `${field}: ${value}` : null;
      })
      .filter(Boolean)
      .join('\n');
  }
}
