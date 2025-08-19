import { AISDKService } from '@/services/ai/core/ai-sdk-service';
import { icpProfilesService, companiesService } from '@/services/database';
import type {
  Campaign,
  CampaignGenerationRequest,
  CampaignGenerationResponse,
  CopyStyle,
  MediaType,
} from '../core/types';

export class CampaignGenerator {
  private aiService: AISDKService;

  constructor() {
    this.aiService = AISDKService.getInstance();
  }

  async generateCampaign(
    request: CampaignGenerationRequest,
  ): Promise<CampaignGenerationResponse> {
    try {
      const { icpId, copyStyle, mediaType, imagePrompt, campaignDetails } =
        request;

      // Get ICP data from database
      const icpData = await this.getICPData(icpId);

      // Get company data for additional context
      const companyData = await this.getCompanyData(icpId);

      console.log(
        'ICP Data size:',
        JSON.stringify(icpData).length,
        'characters',
      );
      console.log(
        'Company Data size:',
        companyData ? JSON.stringify(companyData).length : 0,
        'characters',
      );

      const prompt = this.buildCampaignPrompt({
        icpData,
        companyData,
        copyStyle,
        mediaType,
        imagePrompt,
        campaignDetails,
      });

      // Simplified system prompt
      const systemPrompt = `You are a marketing copywriter. Generate ONLY a valid JSON object with the exact structure requested. No explanations, no markdown, no extra text. Use double quotes for all strings.`;

      const response = await this.aiService.generateResponse(
        prompt,
        systemPrompt,
      );

      console.log('AI Response received:', response.substring(0, 500) + '...');

      const campaign = this.parseCampaignResponse(response, request);

      return {
        campaign,
        success: true,
      };
    } catch (error) {
      console.error('Error generating campaign:', error);
      return {
        campaign: {} as Campaign,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate campaign',
      };
    }
  }

  private buildCampaignPrompt(params: {
    icpData: any;
    companyData: any;
    copyStyle: CopyStyle;
    mediaType: MediaType;
    imagePrompt?: string;
    campaignDetails?: string;
  }): string {
    const {
      icpData,
      companyData,
      copyStyle,
      mediaType,
      imagePrompt,
      campaignDetails,
    } = params;

    // Create a simplified, focused prompt to reduce parsing errors
    const icpSummary = {
      name: icpData.icp_name,
      businessModel: icpData.business_model,
      segments: icpData.segments?.slice(0, 3),
      painPoints: icpData.needs_pain_goals?.pains?.slice(0, 3),
      goals: icpData.needs_pain_goals?.desired_outcomes?.slice(0, 3),
      buyingTriggers: icpData.buying_triggers?.slice(0, 3),
    };

    const companySummary = companyData
      ? {
          name: companyData.name,
          industry: companyData.industry,
          valueProposition: companyData.valueProposition,
          mainOfferings: companyData.mainOfferings,
        }
      : null;

    return `
Create a marketing campaign for ${mediaType} platform with ${copyStyle} tone.

TARGET AUDIENCE:
${JSON.stringify(icpSummary, null, 2)}

${companySummary ? `COMPANY: ${JSON.stringify(companySummary, null, 2)}` : ''}

${imagePrompt ? `IMAGE CONTEXT: ${imagePrompt}` : ''}
${campaignDetails ? `CAMPAIGN DETAILS: ${campaignDetails}` : ''}

Generate ONLY a JSON object with this exact structure:
{
  "adCopy": "Compelling ad copy for ${mediaType}",
  "cta": "Clear call-to-action",
  "hooks": "Hook 1|Hook 2|Hook 3|Hook 4|Hook 5",
  "landingPageCopy": "Persuasive landing page content",
  "imageSuggestion": "Image description for AI generation"
}

Return ONLY the JSON object, no other text.
`;
  }

  private parseCampaignResponse(
    response: string,
    request: CampaignGenerationRequest,
  ): Campaign {
    try {
      const parsed = this.sanitizeAndParseResponse(response);

      const hooksValue = Array.isArray(parsed.hooks)
        ? (parsed.hooks as string[]).join(' | ')
        : typeof parsed.hooks === 'string'
        ? parsed.hooks
        : '';

      return {
        id: this.generateId(),
        name: `Campaign for ${request.mediaType}`,
        icpId: request.icpId,
        copyStyle: request.copyStyle,
        mediaType: request.mediaType,
        adCopy: parsed.adCopy || '',
        imagePrompt: request.imagePrompt,
        cta: parsed.cta || '',
        hooks: hooksValue,
        landingPageCopy: parsed.landingPageCopy || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error parsing campaign response:', error);
      console.error(
        'Raw response that failed to parse:',
        response.substring(0, 1000),
      );
      throw new Error('Failed to parse campaign response');
    }
  }

  // Attempts to extract and parse a JSON object from LLM output
  private sanitizeAndParseResponse(responseText: string): {
    adCopy?: string;
    cta?: string;
    hooks?: string | string[];
    landingPageCopy?: string;
    imageSuggestion?: string;
  } {
    let text = responseText?.trim() || '';

    console.log('Raw AI response:', text.substring(0, 1000));

    // Remove markdown code fences if present
    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
      if (text.endsWith('```')) {
        text = text.replace(/```\s*$/, '');
      }
    }

    // Strip any JS-style comments that might sneak in
    // Remove /* ... */ and // ... end-of-line comments conservatively
    text = text
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|\n)\s*\/\/.*(?=\n|$)/g, '$1');

    // Extract the first balanced top-level JSON object to avoid extra chatter
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (ch === '{') depth++;
        if (ch === '}') depth--;
        if (depth === 0) {
          text = text.slice(start, i + 1);
          break;
        }
      }
    }

    // Last attempt: remove trailing commas which break JSON
    // Note: conservative replace for ",}\n" and ",]\n"
    text = text.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

    console.log('Cleaned text for parsing:', text.substring(0, 500));

    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse text:', text);

      // Fallback: return a basic structure with error message
      return {
        adCopy: 'Error: Could not parse AI response. Please try again.',
        cta: 'Learn More',
        hooks:
          'Discover how we can help|Transform your business today|Get started now|See the difference|Contact us today',
        landingPageCopy:
          'We apologize, but there was an issue generating the campaign content. Please try generating the campaign again.',
        imageSuggestion: 'Professional business meeting or collaboration scene',
      };
    }
  }

  private async getICPData(icpId: string): Promise<any> {
    try {
      const icpProfile = await icpProfilesService.getProfileById(icpId);

      if (!icpProfile) {
        throw new Error(`ICP profile with id ${icpId} not found`);
      }

      // Return the actual ICP data
      return icpProfile.profileData;
    } catch (error) {
      console.error('Error fetching ICP data:', error);
      throw new Error(
        `Failed to fetch ICP data for id ${icpId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  private async getCompanyData(icpId: string): Promise<any> {
    try {
      // First get the ICP profile to find the company ID
      const icpProfile = await icpProfilesService.getProfileById(icpId);

      if (!icpProfile || !icpProfile.companyId) {
        console.warn(`No company ID found for ICP ${icpId}`);
        return null;
      }

      // Get company data using the company ID
      const companyData = await companiesService.getCompanyWithData(
        icpProfile.companyId.toString(),
      );

      if (!companyData) {
        console.warn(
          `No company data found for company ID ${icpProfile.companyId}`,
        );
        return null;
      }

      // Return only essential company data for campaign generation
      return {
        name: companyData.name,
        industry: companyData.data?.industry,
        valueProposition: companyData.data?.valueProposition,
        mainOfferings: companyData.data?.mainOfferings,
        uniqueFeatures: companyData.data?.uniqueFeatures,
        competitiveAdvantages: companyData.data?.competitiveAdvantages,
      };
    } catch (error) {
      console.error('Error fetching company data:', error);
      // Don't throw error for company data - it's optional context
      return null;
    }
  }

  private generateId(): string {
    return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
