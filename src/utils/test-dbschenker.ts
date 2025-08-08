/**
 * Specific test for DB Schenker review fetching issue
 */

import { ReviewsService } from '../services/reviews-service';
import {
  debugReviewFetching,
  formatDebugResults,
} from './debug-review-fetching';

export async function testDBSchenkerReviews() {
  console.log('🚛 Testing DB Schenker Review Fetching (Improved)...\n');

  // Test with the actual domain being used
  const testCases = [
    { name: 'DB Schenker', website: 'dbschenker.fi' }, // Use the actual domain
    { name: 'DB Schenker', website: 'dbschenker.com' }, // Also try .com
    { name: 'Schenker', website: 'dbschenker.fi' }, // Try just company name
  ];

  for (const testCase of testCases) {
    console.log(`\n📦 Testing: ${testCase.name} with ${testCase.website}`);
    console.log('─'.repeat(50));

    try {
      // Test the actual service directly
      console.log('🔍 Testing improved review fetching...');
      const reviews = await ReviewsService.fetchCustomerReviews(
        testCase.name,
        testCase.website,
      );

      if (reviews && reviews.trim().length > 0) {
        const reviewBlocks = reviews.split('\n\n').filter(Boolean);
        console.log(`🎉 SUCCESS: Found ${reviewBlocks.length} reviews!`);
        console.log(
          'First review preview:',
          reviews.split('\n\n')[0]?.substring(0, 200) + '...',
        );

        // Show a few reviews
        reviewBlocks.slice(0, 3).forEach((review, i) => {
          console.log(`\nReview ${i + 1}:`);
          console.log(
            review.substring(0, 150) + (review.length > 150 ? '...' : ''),
          );
        });
      } else {
        console.log('❌ No reviews found - running debug analysis...');
        const debugSteps = await debugReviewFetching(
          testCase.name,
          testCase.website,
        );
        const formatted = formatDebugResults(debugSteps);
        console.log(formatted);
      }
    } catch (error) {
      console.error(
        `❌ Error testing ${testCase.name} with ${testCase.website}:`,
        error,
      );
    }
  }

  console.log('\n🔍 Summary:');
  console.log('The improved system should now:');
  console.log('✓ Handle any domain (.com, .fi, .de, etc.)');
  console.log('✓ Use more flexible content filtering');
  console.log('✓ Try search-based approaches when direct pages fail');
  console.log('✓ Have longer timeouts to prevent abort errors');
  console.log('✓ Use fallback with very lenient filtering');
}

// Quick function to test if the issue is company-specific
export async function compareCompanyReviews() {
  console.log('🔄 Comparing review fetching across different companies...\n');

  const companies = [
    { name: 'UPS', website: 'ups.com' },
    { name: 'FedEx', website: 'fedex.com' },
    { name: 'DHL', website: 'dhl.com' },
    { name: 'DB Schenker', website: 'dbschenker.fi' }, // Use the actual domain
  ];

  for (const company of companies) {
    try {
      console.log(`Testing ${company.name}...`);
      const reviews = await ReviewsService.fetchCustomerReviews(
        company.name,
        company.website,
      );
      const count = reviews ? reviews.split('\n\n').filter(Boolean).length : 0;
      console.log(`${company.name}: ${count} reviews`);
    } catch (error) {
      console.log(`${company.name}: ERROR - ${error}`);
    }
  }
}
