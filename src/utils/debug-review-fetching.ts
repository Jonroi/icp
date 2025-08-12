/**
 * Debug utility for Apify Google Maps API review fetching - shows detailed step-by-step process
 */

import { ApifyReviewsService } from '../services/apify-reviews-service';

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

  // Step 1: Check Apify API configuration
  steps.push({
    step: '1. Checking Apify API configuration',
    success: true,
  });

  const apiConfig = ApifyReviewsService.getApiConfig();
  steps.push({
    step: '2. Apify API configuration',
    success: apiConfig.isConfigured,
    data: apiConfig,
  });

  if (!apiConfig.isConfigured) {
    steps.push({
      step: '3. Apify API not configured',
      success: false,
      error:
        'Apify API token not found. Please set VITE_APIFY_API_TOKEN environment variable.',
    });
    return steps;
  }

  // Step 3: Test Apify API connection
  steps.push({
    step: '3. Testing Apify API connection',
    success: true,
  });

  try {
    const testResult = await ApifyReviewsService.testConnection();
    steps.push({
      step: '4. Apify API connection test',
      success: testResult.success,
      data: testResult,
    });
  } catch (error) {
    steps.push({
      step: '4. Apify API connection test failed',
      success: false,
      error: String(error),
    });
    return steps;
  }

  // Step 5: Fetch data using Apify Google Maps API
  steps.push({
    step: '5. Fetching data using Apify Google Maps API',
    success: true,
    data: { companyName, website },
  });

  try {
    const reviews = await ApifyReviewsService.fetchCustomerReviews(
      companyName,
      {
        website,
        location: 'Finland',
        maxResults: 20, // Set to exactly 20 reviews for optimal cost control
        includeMarketData: true,
      },
    );

    steps.push({
      step: '6. Apify Google Maps API data fetch completed',
      success: true,
      count: reviews.length,
      data: reviews.substring(0, 500) + '...',
    });
  } catch (error) {
    steps.push({
      step: '6. Apify Google Maps API data fetch failed',
      success: false,
      error: String(error),
    });
  }

  return steps;
}

export function formatDebugResults(steps: DebugStep[]): string {
  let output = '🔍 Apify Google Maps API Data Fetching Debug Results\n';
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
