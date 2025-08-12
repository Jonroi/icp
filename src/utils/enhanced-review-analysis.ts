/**
 * Enhanced review analysis utility - demonstrates all improvements to the ICP Builder
 */

import { ApifyReviewsService } from '../services/apify-reviews-service';
import { ReviewAnalyzer } from '../services/ai/review-analyzer';
import { ICPGenerator } from '../services/ai/icp-generator';

export interface EnhancedAnalysisStep {
  step: string;
  success: boolean;
  data?: unknown;
  error?: string;
  duration?: number;
  insights?: {
    sentiment?: string;
    painPoints?: string[];
    customerSegments?: string[];
    recommendations?: string[];
  };
}

export async function enhancedReviewAnalysis(
  companyName: string,
  website?: string,
): Promise<EnhancedAnalysisStep[]> {
  const steps: EnhancedAnalysisStep[] = [];

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

  // Step 3: Test Apify API connection with retry logic
  steps.push({
    step: '3. Testing Apify API connection with retry logic',
    success: true,
  });

  try {
    const startTime = Date.now();
    const testResult = await ApifyReviewsService.testConnection();
    const duration = Date.now() - startTime;

    steps.push({
      step: '4. Apify API connection test with retry logic',
      success: testResult.success,
      data: testResult,
      duration,
    });
  } catch (error) {
    steps.push({
      step: '4. Apify API connection test failed',
      success: false,
      error: String(error),
    });
    return steps;
  }

  // Step 5: Fetch data with enhanced analysis
  steps.push({
    step: '5. Fetching data with enhanced sentiment analysis and pain point extraction',
    success: true,
    data: { companyName, website },
  });

  try {
    const startTime = Date.now();
    const reviews = await ApifyReviewsService.fetchStructuredReviews(
      companyName,
      {
        website,
        location: 'Finland',
        maxResults: 20, // Set to exactly 20 reviews for optimal cost control
        includeMarketData: true,
        includeSentimentAnalysis: true,
        includePainPoints: true,
      },
    );
    const duration = Date.now() - startTime;

    steps.push({
      step: '6. Enhanced review collection completed',
      success: true,
      data: {
        totalReviews: reviews.reviews.length,
        dataSources: reviews.dataSources.length,
        sentimentAnalysis: reviews.metadata.sentimentAnalysis,
        painPoints: reviews.metadata.painPoints,
        keyInsights: reviews.metadata.keyInsights,
      },
      duration,
      insights: {
        sentiment: reviews.metadata.sentimentAnalysis
          ? `${reviews.metadata.sentimentAnalysis.positive} positive, ${reviews.metadata.sentimentAnalysis.negative} negative`
          : undefined,
        painPoints: reviews.metadata.painPoints,
        customerSegments: reviews.metadata.keyInsights?.slice(0, 3),
      },
    });

    // Step 7: Advanced review analysis using ReviewAnalyzer
    steps.push({
      step: '7. Performing advanced review analysis with ReviewAnalyzer',
      success: true,
    });

    const analysisStartTime = Date.now();
    const batchAnalysis = ReviewAnalyzer.analyzeBatch(reviews.reviews);
    const icpInsights = ReviewAnalyzer.extractICPInsights(reviews.reviews);
    const analysisDuration = Date.now() - analysisStartTime;

    steps.push({
      step: '8. Advanced review analysis completed',
      success: true,
      data: {
        sentimentDistribution: batchAnalysis.sentimentDistribution,
        averageRating: batchAnalysis.averageRating,
        topPainPoints: batchAnalysis.topPainPoints.slice(0, 5),
        customerSegments: batchAnalysis.customerSegments.slice(0, 5),
        emotionalTrends: batchAnalysis.emotionalTrends.slice(0, 3),
        recommendations: batchAnalysis.recommendations,
        icpInsights,
      },
      duration: analysisDuration,
      insights: {
        sentiment: `${batchAnalysis.sentimentDistribution.positive} positive, ${batchAnalysis.sentimentDistribution.negative} negative`,
        painPoints: batchAnalysis.topPainPoints.slice(0, 3).map((p) => p.point),
        customerSegments: batchAnalysis.customerSegments
          .slice(0, 3)
          .map((s) => s.segment),
        recommendations: batchAnalysis.recommendations.slice(0, 3),
      },
    });

    // Step 9: Generate ICPs with enhanced insights
    steps.push({
      step: '9. Generating ICPs with enhanced review insights',
      success: true,
    });

    const icpStartTime = Date.now();
    const icpGenerator = new ICPGenerator();
    const icps = await icpGenerator.generateApifyBasedICPs(
      [{ name: companyName, website: website || '', social: '' }],
      reviews.reviews,
      'Enhanced analysis with sentiment and pain point extraction',
      reviews.dataSources,
    );
    const icpDuration = Date.now() - icpStartTime;

    steps.push({
      step: '10. ICP generation with enhanced insights completed',
      success: true,
      data: {
        icps: icps.map((icp) => ({
          name: icp.name,
          confidence: icp.confidence,
          dataSources: icp.dataSources.length,
        })),
      },
      duration: icpDuration,
    });
  } catch (error) {
    steps.push({
      step: '6. Enhanced review analysis failed',
      success: false,
      error: String(error),
    });
  }

  return steps;
}

export function formatEnhancedAnalysisResults(
  steps: EnhancedAnalysisStep[],
): string {
  let output = '🔍 Enhanced Review Analysis Results - ICP Builder\n';
  output += '='.repeat(60) + '\n\n';

  for (const step of steps) {
    const status = step.success ? '✅' : '❌';
    output += `${status} ${step.step}\n`;

    if (step.duration !== undefined) {
      output += `   Duration: ${step.duration}ms\n`;
    }

    if (step.insights) {
      output += `   Insights:\n`;
      if (step.insights.sentiment) {
        output += `     Sentiment: ${step.insights.sentiment}\n`;
      }
      if (step.insights.painPoints && step.insights.painPoints.length > 0) {
        output += `     Pain Points: ${step.insights.painPoints.join(', ')}\n`;
      }
      if (
        step.insights.customerSegments &&
        step.insights.customerSegments.length > 0
      ) {
        output += `     Customer Segments: ${step.insights.customerSegments.join(
          ', ',
        )}\n`;
      }
      if (
        step.insights.recommendations &&
        step.insights.recommendations.length > 0
      ) {
        output += `     Recommendations: ${step.insights.recommendations.join(
          ', ',
        )}\n`;
      }
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

  // Add summary
  const successfulSteps = steps.filter((s) => s.success).length;
  const totalSteps = steps.length;
  const totalDuration = steps.reduce(
    (sum, step) => sum + (step.duration || 0),
    0,
  );

  output += '📊 SUMMARY\n';
  output += '-'.repeat(30) + '\n';
  output += `Total Steps: ${totalSteps}\n`;
  output += `Successful: ${successfulSteps}\n`;
  output += `Success Rate: ${((successfulSteps / totalSteps) * 100).toFixed(
    1,
  )}%\n`;
  output += `Total Duration: ${totalDuration}ms\n`;

  return output;
}
