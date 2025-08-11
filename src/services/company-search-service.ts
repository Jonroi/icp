import { AIServiceErrorFactory, InputValidator } from './ai/error-types';

export interface CompanySearchResult {
  name: string;
  website: string;
  social: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

export class CompanySearchService {
  static async searchCompanyWithLLM(companyName: string): Promise<{
    website: string;
    social: string;
    confidence: 'high' | 'medium' | 'low';
    notes: string;
  }> {
    // Validate input
    const validation = InputValidator.validateCompanyName(companyName);
    if (!validation.isValid) {
      throw AIServiceErrorFactory.createCompanySearchError(
        'INVALID_COMPANY_NAME',
        `Invalid company name: ${validation.errors
          .map((e) => e.message)
          .join(', ')}`,
        [companyName],
      );
    }

    console.log(`🤖 LLM search for: ${companyName}`);

    try {
      const prompt = `You are a business directory assistant. Find the official website and LinkedIn page for "${companyName}".

INSTRUCTIONS:
1. First check if you know this company from any industry or country
2. If you know it, provide exact URLs
3. If you don't know it exactly, make educated guesses based on the company name
4. Prefer .com domains for international companies
5. LinkedIn often uses: https://www.linkedin.com/company/companyname

FORMAT (return exactly these two lines):
Website: [URL]
LinkedIn: [URL]

EXAMPLES:
Nokia:
Website: https://www.nokia.com
LinkedIn: https://www.linkedin.com/company/nokia

McDonald's:
Website: https://www.mcdonalds.com
LinkedIn: https://www.linkedin.com/company/mcdonalds-corporation

FOR "${companyName}" - provide your best guess even if not 100% certain:`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: prompt,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      const llmResponse = data.response.trim();

      console.log('LLM response:', llmResponse);

      // Parse the response
      const lines = llmResponse.split('\n');
      let website = '';
      let linkedin = '';

      for (const line of lines) {
        if (line.toLowerCase().includes('website:')) {
          const colonIndex = line.indexOf(':');
          const url = line.substring(colonIndex + 1).trim();
          if (url && url !== 'unknown' && url.startsWith('http')) {
            website = url;
          }
        }
        if (line.toLowerCase().includes('linkedin:')) {
          const colonIndex = line.indexOf(':');
          const url = line.substring(colonIndex + 1).trim();
          if (url && url !== 'unknown' && url.startsWith('http')) {
            linkedin = url;
          }
        }
      }

      // If no valid URLs found, this is a search failure
      if (!website && !linkedin) {
        throw AIServiceErrorFactory.createCompanySearchError(
          'COMPANY_NOT_FOUND',
          `No company information found for "${companyName}". The company may not exist online or LLM doesn't have information about it.`,
          [companyName],
        );
      }

      return {
        website: website,
        social: linkedin,
        confidence:
          website && linkedin ? 'high' : website || linkedin ? 'medium' : 'low',
        notes: `LLM search completed`,
      };
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        // Re-throw our custom errors
        throw error;
      }

      console.error('LLM search failed:', error);
      throw AIServiceErrorFactory.createCompanySearchError(
        'LLM_SEARCH_FAILED',
        `Company search failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        [companyName],
        error instanceof Error ? error : undefined,
      );
    }
  }

  static async searchCompanyOnline(
    companyName: string,
  ): Promise<CompanySearchResult> {
    try {
      console.log(`Starting LLM search for: ${companyName}`);

      // Use LLM to find company information
      const llmResults = await this.searchCompanyWithLLM(companyName);

      console.log('LLM search results:', llmResults);

      // Return results from LLM search
      return {
        name: companyName,
        website: llmResults.website,
        social: llmResults.social,
        facebook: '',
        twitter: '',
        instagram: '',
        confidence: llmResults.confidence,
        notes: `🤖 LLM SEARCH: ${llmResults.notes}`,
      };
    } catch (error) {
      console.error('Error in LLM search:', error);

      // Return empty results
      return {
        name: companyName,
        website: '',
        social: '',
        facebook: '',
        twitter: '',
        instagram: '',
        confidence: 'low',
        notes: 'LLM search failed - no information found',
      };
    }
  }
}
