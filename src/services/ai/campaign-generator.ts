import { AISDKService } from './ai-sdk-service';
import type {
  Campaign,
  CampaignGenerationRequest,
  CampaignGenerationResponse,
  CopyStyle,
  MediaType,
} from './types';

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

      // Get ICP data from database (this would be injected or fetched)
      const icpData = await this.getICPData(icpId);

      const prompt = this.buildCampaignPrompt({
        icpData,
        copyStyle,
        mediaType,
        imagePrompt,
        campaignDetails,
      });

      // System prompt to enforce quality, safety and structure
      const systemPrompt = `You are a senior performance marketer and copy chief.
Your goals:
- Generate high-converting, platform-specific campaign copy using the provided ICP.
- Be precise, benefit-led, and free of fluff or clichés.

Hard constraints:
- Language: English only.
- No markdown, no code fences, no extra commentary.
- Output must be a single valid JSON object that matches the requested schema.
- Do not invent facts outside the ICP/context; make reasonable, domain-consistent assumptions only.
- Respect tone (copyStyle) strictly:
  - facts: authoritative, evidence-driven, specific metrics when plausible
  - humour: light, clever, never offensive; keep brand-safe
  - smart: insightful, concise, consultative
  - emotional: outcome-oriented, empathetic, motivational
  - professional: formal, clear, decision-maker friendly
- Adapt to mediaType:
  - google-ads: compact, punchy ad copy; avoid walls of text; CTA crisp
  - linkedin: professional tone; insight-led; light formatting implied, but return as plain text
  - email: persuasive single-message flow; a strong lead-in and clear CTA in body
  - print: scannable headline + persuasive body; timeless tone
  - social-media: concise hooks; conversational energy without slang overload
- Safety: do not include discriminatory, unsafe, or medical/financial advice beyond general marketing claims.
`;

      const response = await this.aiService.generateResponse(
        prompt,
        systemPrompt,
      );

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

REQUIRED OUTPUT STRUCTURE (STRICT):

1. AD COPY: Create compelling, platform-optimized copy that speaks directly to the ICP's pain points and goals. Make it engaging and conversion-focused.

2. CALL-TO-ACTION: Design a clear, action-oriented CTA that motivates the target audience to take the desired action. Make it specific and compelling.

3. HOOKS: Generate 5 attention-grabbing hooks for the landing page that will immediately capture the ICP's attention and address their specific needs.

4. LANDING PAGE COPY: Write persuasive, benefit-focused copy for the landing page that builds trust, addresses objections, and drives conversions.

5. IMAGE SUGGESTION: Provide a detailed, creative description for AI image generation that will complement the campaign and resonate with the target audience.

Respond with ONLY a single valid JSON object and nothing else (no explanations, no markdown, no code fences). The JSON must strictly match this schema and use double quotes for all keys/strings:
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

    const parsed = JSON.parse(text);
    return parsed;
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
