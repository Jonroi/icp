import { OllamaClient } from './ollama-client';

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export class ReviewAgent {
  private ollamaClient: OllamaClient;

  constructor() {
    this.ollamaClient = OllamaClient.getInstance();
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
      console.error('Failed to parse LLM validation response:', parseError);
      throw new Error(
        `Failed to parse review validation response: ${
          parseError instanceof Error ? parseError.message : 'Unknown error'
        }`,
      );
    }
  }
}
