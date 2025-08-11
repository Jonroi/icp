/**
 * Test script for SERP API integration
 * Run this to verify SERP API configuration and functionality
 */

import { SerpReviewsService, SerpApiClient } from '../services';

async function testSerpApiIntegration() {
  console.log('🧪 Testing SERP API Integration...\n');

  // Test 1: Check configuration
  console.log('1️⃣ Checking SERP API Configuration...');
  const config = SerpReviewsService.getApiConfig();
  console.log(`   Provider: ${config.provider}`);
  console.log(`   Has API Key: ${config.hasApiKey}`);
  console.log(`   Is Configured: ${config.isConfigured}`);

  if (!config.isConfigured) {
    console.log(
      '❌ SERP API not configured. Please set SERP_API_KEY in environment variables.',
    );
    console.log('📖 See SERP_API_SETUP.md for setup instructions.');
    return;
  }

  console.log('✅ SERP API configuration looks good!\n');

  // Test 2: Test connectivity
  console.log('2️⃣ Testing SERP API Connectivity...');
  try {
    const connectionTest = await SerpReviewsService.testConnection();
    if (connectionTest.success) {
      console.log('✅', connectionTest.message);
      console.log('   Details:', connectionTest.details);
    } else {
      console.log('❌', connectionTest.message);
      console.log('   Error:', connectionTest.details);
      return;
    }
  } catch (error) {
    console.log('❌ Connection test failed:', error);
    return;
  }

  console.log('');

  // Test 3: Test review collection
  console.log('3️⃣ Testing Review Collection...');
  try {
    const testCompany = 'Nokia'; // Well-known company with reviews
    console.log(`   Collecting reviews for: ${testCompany}`);

    const reviews = await SerpReviewsService.fetchCustomerReviews(testCompany, {
      location: 'Finland',
      maxResults: 5, // Keep it small for testing
    });

    console.log(
      `✅ Successfully collected reviews (${reviews.length} characters)`,
    );
    console.log(`   Preview: ${reviews.substring(0, 200)}...`);
  } catch (error) {
    console.log('❌ Review collection failed:', error);
    return;
  }

  console.log('');

  // Test 4: Test structured data collection
  console.log('4️⃣ Testing Structured Data Collection...');
  try {
    const structuredData = await SerpReviewsService.fetchStructuredReviews(
      "McDonald's",
      {
        location: 'Finland',
        maxResults: 3,
        includeMarketData: true,
      },
    );

    console.log(`✅ Structured data collection successful:`);
    console.log(`   Reviews: ${structuredData.reviews.length}`);
    console.log(`   Data Sources: ${structuredData.dataSources.length}`);
    console.log(
      `   Search Queries: ${structuredData.metadata.searchQueries.join(', ')}`,
    );

    // Show sample review
    if (structuredData.reviews.length > 0) {
      const sampleReview = structuredData.reviews[0];
      console.log(
        `   Sample Review: "${sampleReview.text.substring(0, 100)}..."`,
      );
      console.log(`   Platform: ${sampleReview.platform || 'Unknown'}`);
    }
  } catch (error) {
    console.log('❌ Structured data collection failed:', error);
    return;
  }

  console.log('');

  // Test 5: Test direct SERP client
  console.log('5️⃣ Testing Direct SERP Client...');
  try {
    const serpClient = new SerpApiClient();
    const searchResults = await serpClient.searchCompanyReviews('Spotify', {
      location: 'Finland',
      maxResults: 2,
    });

    console.log(`✅ Direct SERP client working:`);
    console.log(`   Results: ${searchResults.length}`);
    if (searchResults.length > 0) {
      console.log(`   Sample: "${searchResults[0].text.substring(0, 80)}..."`);
      console.log(`   Source: ${searchResults[0].platform}`);
    }
  } catch (error) {
    console.log('❌ Direct SERP client failed:', error);
    return;
  }

  console.log('');

  // Summary
  console.log('🎉 All SERP API integration tests passed!');
  console.log('');
  console.log('✅ Configuration: Working');
  console.log('✅ Connectivity: Working');
  console.log('✅ Review Collection: Working');
  console.log('✅ Structured Data: Working');
  console.log('✅ Direct Client: Working');
  console.log('');
  console.log('🚀 Your SERP API integration is ready for ICP generation!');
  console.log('📖 See SERP_API_SETUP.md for usage examples.');
}

// Test function for specific company
async function testSpecificCompany(companyName: string) {
  console.log(`🔍 Testing SERP API for: ${companyName}\n`);

  try {
    const startTime = Date.now();

    const structuredData = await SerpReviewsService.fetchStructuredReviews(
      companyName,
      {
        location: 'Finland',
        maxResults: 10,
        includeMarketData: true,
        includeCompetitorData: true,
      },
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Results for ${companyName}:`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📊 Total Reviews: ${structuredData.reviews.length}`);
    console.log(`   🔍 Data Sources: ${structuredData.dataSources.length}`);
    console.log(`   📍 Location: ${structuredData.metadata.location}`);
    console.log(`   🕒 Timestamp: ${structuredData.metadata.timestamp}`);

    console.log('\n📊 Data Sources:');
    structuredData.dataSources.forEach((source, index) => {
      console.log(
        `   ${index + 1}. ${source.type}: "${source.query}" (${
          source.resultCount
        } results)`,
      );
    });

    console.log('\n📝 Sample Reviews:');
    structuredData.reviews.slice(0, 3).forEach((review, index) => {
      console.log(
        `   ${index + 1}. [${review.platform || 'Web'}] ${review.text.substring(
          0,
          120,
        )}...`,
      );
      if (review.rating) console.log(`      Rating: ${review.rating}/5`);
      if (review.date) console.log(`      Date: ${review.date}`);
    });

    console.log('\n🔗 Search Queries Used:');
    structuredData.metadata.searchQueries.forEach((query, index) => {
      console.log(`   ${index + 1}. "${query}"`);
    });

    return structuredData;
  } catch (error) {
    console.log(`❌ Error testing ${companyName}:`, error);
    return null;
  }
}

// Test function for ICP generation with SERP data
async function testICPGenerationWithSerpData(companyName: string) {
  console.log(`🎯 Testing ICP Generation with SERP data for: ${companyName}\n`);

  try {
    // Import here to avoid circular dependencies in test environment
    const { AIService } = await import('../services');
    const aiService = new AIService();

    // Step 1: Collect SERP data
    console.log('1️⃣ Collecting SERP data...');
    const serpData = await SerpReviewsService.fetchStructuredReviews(
      companyName,
      {
        location: 'Finland',
        maxResults: 15,
        includeMarketData: true,
      },
    );

    console.log(
      `   ✅ Collected ${serpData.reviews.length} reviews from ${serpData.dataSources.length} sources`,
    );

    // Step 2: Define competitors (minimal for testing)
    const competitors = [
      {
        name: 'Competitor A',
        website: 'https://competitor-a.com',
        social: 'LinkedIn',
      },
    ];

    // Step 3: Generate ICPs
    console.log('2️⃣ Generating ICPs with SERP data...');
    const startTime = Date.now();

    const icps = await aiService.generateICPs(
      competitors,
      serpData.reviews,
      `Company: ${companyName}\nLocation: Finland\nIndustry: Technology`,
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`   ✅ Generated ${icps.length} ICP profiles in ${duration}ms`);

    // Step 4: Display results
    console.log('\n🎯 Generated ICPs:');
    icps.forEach((icp, index) => {
      console.log(`\n   ${index + 1}. ${icp.name}`);
      console.log(`      📝 ${icp.description}`);
      console.log(
        `      👥 Demographics: ${icp.demographics.age}, ${icp.demographics.gender}, ${icp.demographics.location}`,
      );
      console.log(`      💼 Income: ${icp.demographics.income}`);
      console.log(`      🎯 Goals: ${icp.goals.slice(0, 2).join(', ')}`);
      console.log(
        `      📱 Channels: ${icp.preferredChannels.slice(0, 3).join(', ')}`,
      );
    });

    return { serpData, icps };
  } catch (error) {
    console.log(`❌ Error in ICP generation test:`, error);
    return null;
  }
}

// Export test functions
export {
  testSerpApiIntegration,
  testSpecificCompany,
  testICPGenerationWithSerpData,
};

// If run directly
// Only run this test when executed directly in Node.js environment
if (
  typeof process !== 'undefined' &&
  import.meta.url === `file://${process.argv[1]}`
) {
  testSerpApiIntegration().catch(console.error);
}
