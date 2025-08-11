import { OllamaClient } from './ollama-client';

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export class ReviewAgent {
  private ollamaClient: OllamaClient;

  constructor() {
    this.ollamaClient = new OllamaClient();
  }

  async validateReviewBlocks(blocks: string[]): Promise<ValidationResult[]> {
    if (blocks.length === 0) return [];

    const prompt = `You are an expert at identifying genuine customer reviews vs. website navigation, spam, or boilerplate content.

Analyze each text block and determine if it's a REAL CUSTOMER REVIEW. Return JSON array with objects: {isValid: boolean, reason: string}

VALID reviews have:
✓ Personal experience language ("I ordered", "My package", "The delivery was")
✓ Specific details about service, product, or experience
✓ Emotional language (satisfied, disappointed, frustrated, happy)
✓ Time references (days, weeks, "last month")
✓ Problem descriptions or praise
✓ First-person narrative voice

INVALID content includes:
✗ Website navigation ("Home", "Categories", "Login") 
✗ Legal text ("Privacy Policy", "Terms")
✗ Search suggestions ("Insurance agency in United States")
✗ Generic descriptions or company boilerplate
✗ Technical elements (URLs, code, HTML)
✗ Star ratings without context ("5 stars", "4.5/5")
✗ Form instructions or help text

Examples:
VALID: "I ordered a package and it took 10 days to arrive. The delivery driver was helpful but the tracking was poor."
INVALID: "Insurance agency in United States Travel agency in New York"

Text blocks to analyze:

${blocks
  .map(
    (b, i) =>
      `[${i}] ${b.replace(/\n/g, ' ').substring(0, 300)}${
        b.length > 300 ? '...' : ''
      }`,
  )
  .join('\n\n')}

Return JSON array only: [{"isValid": boolean, "reason": "short explanation"}, ...]`;

    const response = await this.ollamaClient.generateResponse(prompt);
    try {
      const parsed = JSON.parse(response) as ValidationResult[];
      return parsed.map((v) => ({
        isValid: !!v.isValid,
        reason: v.reason || '',
      }));
    } catch (parseError) {
      console.warn('Failed to parse LLM validation response:', parseError);
      // Enhanced fallback with better heuristics
      return blocks.map((b) => {
        b.toLowerCase();

        // Strong indicators this is NOT a review
        const negativeIndicators = [
          /^\[.*\]\(.*\)$/, // Markdown links
          /^(home|about|contact|login|search|menu|categories)$/i,
          /(privacy policy|terms|cookie|legal|help\.trustpilot\.com)/i,
          /insurance agency in|travel agency in|furniture store|bank in|payment service/i,
          /companies can ask for reviews|automatic invitations|labeled verified/i,
          /^https?:\/\//, // URLs
          /^\d+(\.\d+)?\s*(stars?|\/5|rating)/i, // Just ratings
        ];

        if (negativeIndicators.some((pattern) => pattern.test(b))) {
          return { isValid: false, reason: 'navigation-or-metadata' };
        }

        // Positive indicators this IS a review
        const hasPersonalLanguage = /\b(I|my|we|our)\b/i.test(b);
        const hasExperienceWords =
          /(order|delivery|service|support|experience|received|shipped|arrived|customer|staff|team|driver|package)\b/i.test(
            b,
          );
        const hasEmotionalLanguage =
          /(good|bad|excellent|terrible|satisfied|disappointed|frustrated|happy|helpful|poor|great|awful)\b/i.test(
            b,
          );
        const hasTimeReference =
          /\b(day|week|month|year|yesterday|ago|last|recent)\b/i.test(b);
        const hasSentenceStructure =
          /[.!?]/.test(b) && b.split(/\s+/).length >= 10;

        const score = [
          hasPersonalLanguage,
          hasExperienceWords,
          hasEmotionalLanguage,
          hasTimeReference,
          hasSentenceStructure,
        ].filter(Boolean).length;

        const isValid = score >= 3 && b.length >= 80;

        return {
          isValid,
          reason: isValid
            ? `heuristic-score-${score}/5`
            : 'insufficient-review-indicators',
        };
      });
    }
  }
}
