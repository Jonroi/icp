/**
 * Test script for improved review fetching functionality
 * Tests the enhanced review extraction to ensure we get real customer reviews
 */

import { ReviewsService } from '../services/reviews-service';

export async function testReviewFetching() {
  console.log('🧪 Testing Enhanced Review Fetching...\n');

  // Test cases with different types of companies
  const testCases = [
    {
      name: 'Delivery Company',
      companyName: 'DHL',
      website: 'dhl.com',
    },
    {
      name: 'E-commerce',
      companyName: 'Amazon',
      website: 'amazon.com',
    },
    {
      name: 'Telecom',
      companyName: 'Verizon',
      website: 'verizon.com',
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📦 Testing: ${testCase.name} (${testCase.companyName})`);
    console.log(`Website: ${testCase.website}`);
    console.log('─'.repeat(50));

    try {
      const startTime = Date.now();
      const reviews = await ReviewsService.fetchCustomerReviews(
        testCase.companyName,
        testCase.website,
      );
      const endTime = Date.now();

      if (!reviews || reviews.trim().length === 0) {
        console.log('❌ No reviews found');
        continue;
      }

      const reviewBlocks = reviews.split('\n\n').filter(Boolean);
      console.log(
        `✅ Found ${reviewBlocks.length} review blocks in ${
          endTime - startTime
        }ms`,
      );

      // Analyze the quality of reviews
      let realReviewCount = 0;
      let navigationCount = 0;
      let suspiciousCount = 0;

      for (const review of reviewBlocks) {
        const lower = review.toLowerCase();

        // Check for navigation/metadata patterns
        if (
          /insurance agency in|travel agency in|furniture store|bank in|payment service/i.test(
            review,
          ) ||
          /companies can ask for reviews|automatic invitations|labeled verified/i.test(
            review,
          ) ||
          /trustpilot|categories|search|filter|privacy policy|terms/i.test(
            review,
          )
        ) {
          navigationCount++;
          console.log(
            `🚫 Navigation/Metadata: "${review.substring(0, 100)}..."`,
          );
        }
        // Check for review indicators
        else if (
          /\b(I|my|we|our)\b/i.test(review) &&
          /(order|delivery|service|support|experience|received|shipped|arrived)\b/i.test(
            review,
          ) &&
          /[.!?]/.test(review) &&
          review.length >= 80
        ) {
          realReviewCount++;
          console.log(`✅ Real Review: "${review.substring(0, 100)}..."`);
        } else {
          suspiciousCount++;
          console.log(`⚠️  Suspicious: "${review.substring(0, 100)}..."`);
        }
      }

      console.log(`\n📊 Review Quality Analysis:`);
      console.log(
        `   Real Reviews: ${realReviewCount}/${
          reviewBlocks.length
        } (${Math.round((realReviewCount / reviewBlocks.length) * 100)}%)`,
      );
      console.log(
        `   Navigation/Metadata: ${navigationCount}/${
          reviewBlocks.length
        } (${Math.round((navigationCount / reviewBlocks.length) * 100)}%)`,
      );
      console.log(
        `   Suspicious: ${suspiciousCount}/${reviewBlocks.length} (${Math.round(
          (suspiciousCount / reviewBlocks.length) * 100,
        )}%)`,
      );

      if (realReviewCount > 0) {
        console.log(
          `🎉 SUCCESS: Found ${realReviewCount} real customer reviews!`,
        );
      } else {
        console.log(
          `⚠️  WARNING: No clear customer reviews found - may need further improvement`,
        );
      }
    } catch (error) {
      console.error(`❌ Error testing ${testCase.name}:`, error);
    }
  }

  console.log('\n🔍 Test Summary:');
  console.log('The enhanced review fetching system should now:');
  console.log('✓ Filter out Trustpilot navigation elements');
  console.log('✓ Remove search suggestions and metadata');
  console.log('✓ Extract actual customer review content');
  console.log('✓ Validate reviews using improved AI agent');
  console.log(
    '\nIf you still see navigation elements, the web scraping may need further refinement.',
  );
}

// Export for use in other test files
export function analyzeReviewQuality(reviews: string): {
  realReviews: number;
  navigation: number;
  suspicious: number;
  total: number;
} {
  const reviewBlocks = reviews.split('\n\n').filter(Boolean);
  let realReviewCount = 0;
  let navigationCount = 0;
  let suspiciousCount = 0;

  for (const review of reviewBlocks) {
    // Check for navigation/metadata patterns from the user's example
    if (
      /insurance agency in|travel agency in|furniture store|bank in|payment service/i.test(
        review,
      ) ||
      /companies can ask for reviews|automatic invitations|labeled verified/i.test(
        review,
      ) ||
      /trustpilot|categories|search|filter|privacy policy|terms/i.test(
        review,
      ) ||
      /^\[.*\]\(.*\)/.test(review.trim()) // Markdown links
    ) {
      navigationCount++;
    }
    // Check for review indicators
    else if (
      /\b(I|my|we|our)\b/i.test(review) &&
      /(order|delivery|service|support|experience|received|shipped|arrived|customer|staff|team|driver|package)\b/i.test(
        review,
      ) &&
      /[.!?]/.test(review) &&
      review.length >= 80
    ) {
      realReviewCount++;
    } else {
      suspiciousCount++;
    }
  }

  return {
    realReviews: realReviewCount,
    navigation: navigationCount,
    suspicious: suspiciousCount,
    total: reviewBlocks.length,
  };
}
