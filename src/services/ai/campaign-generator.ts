import { OllamaClient } from './ollama-client';
import type {
  Campaign,
  CampaignGenerationRequest,
  CampaignGenerationResponse,
  CopyStyle,
  MediaType,
} from './types';

export class CampaignGenerator {
  private ollamaClient: OllamaClient;

  constructor() {
    this.ollamaClient = OllamaClient.getInstance();
  }

  async generateCampaign(
    request: CampaignGenerationRequest,
  ): Promise<CampaignGenerationResponse> {
    try {
      const { icpId, copyStyle, mediaType, imagePrompt, campaignDetails } =
        request;

      // Get ICP data from database (this would be injected or fetched)
      const icpData = await this.getICPData(icpId);

      const prompt = this.buildCampaignPrompt({
        icpData,
        copyStyle,
        mediaType,
        imagePrompt,
        campaignDetails,
      });

      const response = await this.ollamaClient.generateResponse(prompt);

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
    copyStyle: CopyStyle;
    mediaType: MediaType;
    imagePrompt?: string;
    campaignDetails?: string;
  }): string {
    const { icpData, copyStyle, mediaType, imagePrompt, campaignDetails } =
      params;

    return `
You are an expert marketing copywriter specializing in creating high-converting campaigns. You have extensive experience in digital marketing, conversion optimization, and creating compelling copy that drives results.

TARGET AUDIENCE (ICP) - Detailed Profile:
${JSON.stringify(icpData, null, 2)}

CAMPAIGN SPECIFICATIONS:
- Copy Style: ${copyStyle} (create copy that matches this tone and approach)
- Media Type: ${mediaType} (optimize for this specific platform)
${imagePrompt ? `- Image Prompt: ${imagePrompt}` : ''}
${campaignDetails ? `- Campaign Details: ${campaignDetails}` : ''}

REQUIRED OUTPUT STRUCTURE:

1. AD COPY: Create compelling, platform-optimized copy that speaks directly to the ICP's pain points and goals. Make it engaging and conversion-focused.

2. CALL-TO-ACTION: Design a clear, action-oriented CTA that motivates the target audience to take the desired action. Make it specific and compelling.

3. HOOKS: Generate 5 attention-grabbing hooks for the landing page that will immediately capture the ICP's attention and address their specific needs.

4. LANDING PAGE COPY: Write persuasive, benefit-focused copy for the landing page that builds trust, addresses objections, and drives conversions.

5. IMAGE SUGGESTION: Provide a detailed, creative description for AI image generation that will complement the campaign and resonate with the target audience.

Please format your response as valid JSON:
{
  "adCopy": "Your detailed ad copy here",
  "cta": "Your compelling call-to-action here",
  "hooks": "Hook 1|Hook 2|Hook 3|Hook 4|Hook 5",
  "landingPageCopy": "Your comprehensive landing page copy here",
  "imageSuggestion": "Your detailed image suggestion here"
}

Ensure all copy is tailored specifically to the ICP profile and optimized for the selected media type and copy style.
`;
  }

  private parseCampaignResponse(
    response: string,
    request: CampaignGenerationRequest,
  ): Campaign {
    try {
      const parsed = JSON.parse(response);

      return {
        id: this.generateId(),
        name: `Campaign for ${request.mediaType}`,
        icpId: request.icpId,
        copyStyle: request.copyStyle,
        mediaType: request.mediaType,
        adCopy: parsed.adCopy || '',
        imagePrompt: request.imagePrompt,
        cta: parsed.cta || '',
        hooks: parsed.hooks || '',
        landingPageCopy: parsed.landingPageCopy || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error parsing campaign response:', error);
      throw new Error('Failed to parse campaign response');
    }
  }

  private async getICPData(icpId: string): Promise<any> {
    // This would typically fetch from database
    // For now, return mock data
    return {
      name: 'Sample ICP',
      demographics: 'Business owners, 25-45 years old',
      painPoints: 'Time management, cost efficiency',
      goals: 'Increase productivity, reduce costs',
    };
  }

  private generateId(): string {
    return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
