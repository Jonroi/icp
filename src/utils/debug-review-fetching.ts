/**
 * Debug utility for SERP API review fetching - shows detailed step-by-step process
 */

import { SerpReviewsService } from '../services/serp-reviews-service';

export interface DebugStep {
  step: string;
  success: boolean;
  data?: unknown;
  error?: string;
  count?: number;
}

export async function debugReviewFetching(
  companyName: string,
  website?: string,
): Promise<DebugStep[]> {
  const steps: DebugStep[] = [];

  // Step 1: Check SERP API configuration
  steps.push({
    step: '1. Checking SERP API configuration',
    success: true,
  });

  const apiConfig = SerpReviewsService.getApiConfig();
  steps.push({
    step: '2. SERP API configuration',
    success: apiConfig.isConfigured,
    data: apiConfig,
  });

  if (!apiConfig.isConfigured) {
    steps.push({
      step: '3. SERP API not configured',
      success: false,
      error:
        'SERP API key not found. Please set VITE_SERP_API_KEY environment variable.',
    });
    return steps;
  }

  // Step 3: Test SERP API connection
  steps.push({
    step: '3. Testing SERP API connection',
    success: true,
  });

  try {
    const testResult = await SerpReviewsService.testConnection();
    steps.push({
      step: '4. SERP API connection test',
      success: testResult.success,
      data: testResult,
    });
  } catch (error) {
    steps.push({
      step: '4. SERP API connection test failed',
      success: false,
      error: String(error),
    });
    return steps;
  }

  // Step 5: Fetch reviews using SERP API
  steps.push({
    step: '5. Fetching reviews using SERP API',
    success: true,
    data: { companyName, website },
  });

  try {
    const reviews = await SerpReviewsService.fetchCustomerReviews(companyName, {
      website,
      location: 'Finland',
      maxResults: 10,
      includeMarketData: true,
    });

    steps.push({
      step: '6. SERP API review fetch completed',
      success: true,
      count: reviews.length,
      data: reviews.substring(0, 500) + '...',
    });
  } catch (error) {
    steps.push({
      step: '6. SERP API review fetch failed',
      success: false,
      error: String(error),
    });
  }

  return steps;
}

export function formatDebugResults(steps: DebugStep[]): string {
  let output = '🔍 SERP API Review Fetching Debug Results\n';
  output += '='.repeat(50) + '\n\n';

  for (const step of steps) {
    const status = step.success ? '✅' : '❌';
    output += `${status} ${step.step}\n`;

    if (step.count !== undefined) {
      output += `   Count: ${step.count}\n`;
    }

    if (step.data) {
      if (typeof step.data === 'string') {
        output += `   Data: ${step.data}\n`;
      } else {
        output += `   Data: ${JSON.stringify(step.data, null, 2)}\n`;
      }
    }

    if (step.error) {
      output += `   Error: ${step.error}\n`;
    }

    output += '\n';
  }

  return output;
}
