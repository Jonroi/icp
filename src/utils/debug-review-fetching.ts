/**
 * Debug utility for review fetching - shows detailed step-by-step process
 */

import { WebTextFetcher } from '../services/web-text-fetcher';
import { ReviewAgent } from '../services/ai/review-agent';

export interface DebugStep {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
  count?: number;
}

export async function debugReviewFetching(
  companyName: string,
  website?: string,
): Promise<DebugStep[]> {
  const steps: DebugStep[] = [];
  const textFetcher = new WebTextFetcher();

  // Step 1: Extract hostname
  steps.push({
    step: '1. Extract hostname from website',
    success: true,
    data: website,
  });

  let host: string | null = null;
  if (website) {
    try {
      const u = new URL(
        website.startsWith('http') ? website : `https://${website}`,
      );
      host = u.hostname.replace(/^www\./, '');
      steps.push({ step: '2. Hostname extracted', success: true, data: host });
    } catch (error) {
      steps.push({
        step: '2. Hostname extraction failed',
        success: false,
        error: String(error),
      });
      return steps;
    }
  } else {
    steps.push({
      step: '2. No website provided',
      success: false,
      error: 'Website is required',
    });
    return steps;
  }

  // Step 3: Try Trustpilot URLs
  const urls = [
    `https://www.trustpilot.com/review/${host}`,
    `https://www.trustpilot.com/review/${host.replace('.com', '')}`,
    `https://www.trustpilot.com/review/www.${host}`,
  ];

  steps.push({
    step: '3. Generated Trustpilot URLs',
    success: true,
    data: urls,
  });

  let rawText = '';
  let successfulUrl = '';

  for (const url of urls) {
    try {
      steps.push({ step: `4. Attempting to fetch: ${url}`, success: true });

      const text = await textFetcher.fetchStructuredText(url, undefined, 25000);

      if (text && text.length > 100) {
        rawText = text;
        successfulUrl = url;
        steps.push({
          step: `5. Successfully fetched content from ${url}`,
          success: true,
          count: text.length,
          data: text.substring(0, 500) + '...',
        });
        break;
      } else {
        steps.push({
          step: `5. Content too short from ${url}`,
          success: false,
          count: text.length,
          data: text,
        });
      }
    } catch (error) {
      steps.push({
        step: `5. Failed to fetch from ${url}`,
        success: false,
        error: String(error),
      });
    }
  }

  if (!rawText) {
    steps.push({ step: '6. No content fetched from any URL', success: false });
    return steps;
  }

  // Step 6: Split into blocks
  const blocks = rawText
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  steps.push({
    step: '6. Split content into blocks',
    success: true,
    count: blocks.length,
    data: blocks.slice(0, 10), // Show first 10 blocks
  });

  // Step 7: Apply filters
  const stopPhrases = [
    'trustscore',
    'trustpilot',
    'write a review',
    'visit website',
    'suggested searches',
    'categories',
    'blog',
    'for businesses',
    'log in',
    'sign up',
    'image',
    'logo',
    'stars',
    'star',
    'rating',
    'how this company uses trustpilot',
    'cookie',
    'cookies',
    'privacy policy',
    'terms & conditions',
    'terms and conditions',
    'guidelines for reviewers',
    'do not sell my info',
    'modern slavery',
    'system status',
    'legal',
    'preferences',
    'advertising',
    'analytics',
    'insurance agency in united states',
    'travel agency in new york',
    'furniture store near me',
    'bank in chicago',
    'best payment service',
    'companies can ask for reviews',
    'automatic invitations',
    'labeled verified',
    'genuine experiences',
    'tips for writing',
    'great reviews',
    'help.trustpilot.com',
  ];

  const navigationWords = [
    'home',
    'about',
    'contact',
    'help',
    'support',
    'business',
    'categories',
    'search',
    'filter',
    'sort',
    'menu',
    'login',
  ];

  let filteredBlocks: string[] = [];
  let filterReasons: string[] = [];

  for (const block of blocks) {
    const lower = block.toLowerCase();

    // Apply all filters and track reasons
    if (stopPhrases.some((phrase) => lower.includes(phrase))) {
      filterReasons.push(
        `Stopped by phrase: ${stopPhrases.find((p) => lower.includes(p))}`,
      );
      continue;
    }

    if (navigationWords.some((word) => lower === word)) {
      filterReasons.push('Navigation word');
      continue;
    }

    if (block.length < 80) {
      filterReasons.push(`Too short: ${block.length} chars`);
      continue;
    }

    if (/^https?:\/\//.test(block) || /\[.*\]\(.*\)/.test(block)) {
      filterReasons.push('URL or markdown link');
      continue;
    }

    if (/^[A-Z][a-z\s-]+$/.test(block) && block.split(' ').length < 6) {
      filterReasons.push('Title pattern');
      continue;
    }

    if (!/[.!?]/.test(block)) {
      filterReasons.push('No sentence punctuation');
      continue;
    }

    const wordCount = block.split(/\s+/).length;
    if (wordCount < 10 || wordCount > 500) {
      filterReasons.push(`Word count: ${wordCount}`);
      continue;
    }

    // Check for review indicators
    const reviewIndicators = [
      /\b(order|delivery|service|customer|support|experience|product|quality|fast|slow|good|bad|excellent|terrible|recommend|satisfied|disappointed|received|shipped|arrived|helpful|staff|team)\b/i,
      /\b(days?|weeks?|months?|years?)\b/i,
      /\b(\$|£|€|price|cost|money|paid|payment)\b/i,
      /\b(I|we|my|our)\b/i,
    ];

    if (!reviewIndicators.some((pattern) => pattern.test(block))) {
      filterReasons.push('No review indicators');
      continue;
    }

    // Passed all filters
    filteredBlocks.push(block);
  }

  steps.push({
    step: '7. Applied content filters',
    success: true,
    count: filteredBlocks.length,
    data: {
      passed: filteredBlocks.slice(0, 5),
      filterReasons: filterReasons.slice(0, 10),
    },
  });

  // Step 8: AI Validation
  if (filteredBlocks.length > 0) {
    try {
      const agent = new ReviewAgent();
      const validations = await agent.validateReviewBlocks(filteredBlocks);
      const validCount = validations.filter((v) => v.isValid).length;

      steps.push({
        step: '8. AI validation completed',
        success: true,
        count: validCount,
        data: validations.slice(0, 5),
      });
    } catch (error) {
      steps.push({
        step: '8. AI validation failed',
        success: false,
        error: String(error),
      });
    }
  } else {
    steps.push({
      step: '8. No blocks to validate',
      success: false,
    });
  }

  return steps;
}

export function formatDebugResults(steps: DebugStep[]): string {
  let output = '🔍 DEBUG REVIEW FETCHING\n';
  output += '═'.repeat(50) + '\n\n';

  for (const step of steps) {
    const icon = step.success ? '✅' : '❌';
    output += `${icon} ${step.step}\n`;

    if (step.count !== undefined) {
      output += `   Count: ${step.count}\n`;
    }

    if (step.error) {
      output += `   Error: ${step.error}\n`;
    }

    if (step.data) {
      if (typeof step.data === 'string') {
        output += `   Data: ${step.data.substring(0, 200)}${
          step.data.length > 200 ? '...' : ''
        }\n`;
      } else if (Array.isArray(step.data)) {
        output += `   Data: ${step.data.length} items\n`;
        step.data.slice(0, 3).forEach((item, i) => {
          const itemStr =
            typeof item === 'string' ? item : JSON.stringify(item);
          output += `     [${i}] ${itemStr.substring(0, 100)}${
            itemStr.length > 100 ? '...' : ''
          }\n`;
        });
      } else {
        output += `   Data: ${JSON.stringify(step.data, null, 2).substring(
          0,
          300,
        )}\n`;
      }
    }

    output += '\n';
  }

  return output;
}
