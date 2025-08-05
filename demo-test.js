// Demo script for testing ICP & Campaign Insights application without external APIs
// Run this in browser console or Node.js environment

console.log('🚀 ICP & Campaign Insights - Test Mode Demo');
console.log('==========================================');

// Mock data for testing
const mockCompetitors = [
  {
    name: 'TechCorp Solutions',
    website: 'https://techcorp.com',
    social: 'https://linkedin.com/company/techcorp',
    websiteContent:
      'AI-powered marketing automation for B2B companies. Increase conversions by 300%.',
  },
  {
    name: 'MarketingPro',
    website: 'https://marketingpro.fi',
    social: 'https://linkedin.com/company/marketingpro',
    websiteContent:
      'Suomalainen markkinointipalvelu pienten ja keskisuurten yritysten tarpeisiin.',
  },
];

const mockReviews = [
  {
    text: 'Erinomainen palvelu! 35-vuotias yrittäjänä Helsingissä arvostan nopeaa toimitusaikaa.',
    rating: 5,
    source: 'Google Reviews',
    author: 'Matti Virtanen',
  },
  {
    text: 'Hyvä kokemus, mutta hinnat olisivat voineet olla hieman edullisemmat. 28-vuotias naisena Tampereella.',
    rating: 4,
    source: 'Trustpilot',
    author: 'Anna Korhonen',
  },
];

// Test functions
function simulateAPIDelay(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testCompetitorAnalysis() {
  console.log('📊 Testing Competitor Analysis...');
  await simulateAPIDelay(500);

  const analysis = mockCompetitors.map((comp) => ({
    name: comp.name,
    website: comp.website,
    analysis: {
      targetAudience: [
        'Tech-savvy professionals aged 25-40',
        'Small to medium businesses',
      ],
      painPoints: ['Limited budget for marketing tools', 'Time constraints'],
      valueProposition:
        'AI-powered marketing automation that saves time and increases conversions',
      strengths: ['Strong brand recognition', 'Comprehensive feature set'],
      weaknesses: [
        'High pricing for small businesses',
        'Complex onboarding process',
      ],
      opportunities: [
        'Growing demand for AI tools',
        'Expansion to new markets',
      ],
      threats: [
        'New competitors entering market',
        'Economic downturn affecting budgets',
      ],
    },
  }));

  console.log(
    '✅ Competitor analysis completed:',
    analysis.length,
    'competitors analyzed',
  );
  return analysis;
}

async function testReviewAnalysis() {
  console.log('📝 Testing Review Analysis...');
  await simulateAPIDelay(300);

  const analysis = {
    totalReviews: mockReviews.length,
    averageRating:
      mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length,
    demographics: {
      agePatterns: ['35-vuotias', '28-vuotias'],
      genderPatterns: ['yrittäjänä', 'naisena'],
      locationPatterns: ['Helsingissä', 'Tampereella'],
    },
    sentiment: {
      positive: mockReviews.filter((r) => r.rating >= 4).length,
      neutral: mockReviews.filter((r) => r.rating === 3).length,
      negative: mockReviews.filter((r) => r.rating <= 2).length,
    },
  };

  console.log('✅ Review analysis completed:', analysis);
  return analysis;
}

async function testICPGeneration() {
  console.log('👥 Testing ICP Generation...');
  await simulateAPIDelay(800);

  const icps = [
    {
      id: 'icp_1',
      name: 'Tech-savvy Marketing Managers',
      demographics: {
        ageRange: { min: 28, max: 35 },
        gender: { male: 40, female: 60 },
        location: ['Helsinki', 'Espoo', 'Vantaa'],
        incomeLevel: 'medium',
      },
      psychographics: {
        jobTitles: ['Marketing Manager', 'Digital Marketing Specialist'],
        companySize: ['10-50 employees', 'Startup'],
        industry: ['Tech', 'E-commerce'],
        painPoints: ['Limited budget', 'Time constraints', 'ROI measurement'],
      },
      behavior: {
        buyingPower: 7,
        decisionMaking: 'Data-driven',
        preferredChannels: ['LinkedIn', 'Email', 'Google Ads'],
      },
      description:
        'Young marketing professionals in growing tech companies who need efficient, ROI-driven marketing solutions.',
      confidence: 85,
    },
    {
      id: 'icp_2',
      name: 'E-commerce Entrepreneurs',
      demographics: {
        ageRange: { min: 25, max: 40 },
        gender: { male: 50, female: 50 },
        location: ['Koko Suomi'],
        incomeLevel: 'high',
      },
      psychographics: {
        jobTitles: ['Founder', 'CEO', 'E-commerce Manager'],
        companySize: ['1-10 employees', 'Solo entrepreneur'],
        industry: ['E-commerce', 'Retail'],
        painPoints: [
          'Scaling challenges',
          'Customer acquisition',
          'Inventory management',
        ],
      },
      behavior: {
        buyingPower: 8,
        decisionMaking: 'Growth-focused',
        preferredChannels: ['Facebook', 'Instagram', 'TikTok'],
      },
      description:
        'Ambitious e-commerce entrepreneurs looking to scale their online businesses with effective marketing tools.',
      confidence: 90,
    },
  ];

  console.log('✅ ICP generation completed:', icps.length, 'ICPs generated');
  return icps;
}

async function testCampaignGeneration() {
  console.log('🎯 Testing Campaign Generation...');
  await simulateAPIDelay(400);

  const campaigns = [
    {
      title: 'SaaS Free Trial Campaign',
      adCopy:
        'Stop guessing. Start converting. SuperSite AI gives you the data to make decisions that drive revenue. Start your free 14-day trial today.',
      hook: 'Unlock the power of your data.',
      imageSuggestion:
        'A clean, modern dashboard showing positive growth charts and key metrics.',
      targetICP: 'icp_1',
    },
    {
      title: 'E-commerce Flash Sale',
      adCopy:
        '⚡ 48-Hour Flash Sale! ⚡ Get 25% off our entire collection. Limited stock available.',
      hook: 'Your next favorite outfit is on sale.',
      imageSuggestion:
        'A dynamic, eye-catching graphic with bold text announcing the flash sale.',
      targetICP: 'icp_2',
    },
  ];

  console.log(
    '✅ Campaign generation completed:',
    campaigns.length,
    'campaigns created',
  );
  return campaigns;
}

// Main test function
async function runFullTest() {
  console.log('\n🧪 Starting comprehensive test without external APIs...\n');

  try {
    // Test 1: Competitor Analysis
    const competitorResults = await testCompetitorAnalysis();

    // Test 2: Review Analysis
    const reviewResults = await testReviewAnalysis();

    // Test 3: ICP Generation
    const icpResults = await testICPGeneration();

    // Test 4: Campaign Generation
    const campaignResults = await testCampaignGeneration();

    // Summary
    console.log('\n📋 Test Summary:');
    console.log('================');
    console.log(`✅ Competitors analyzed: ${competitorResults.length}`);
    console.log(`✅ Reviews processed: ${reviewResults.totalReviews}`);
    console.log(`✅ ICPs generated: ${icpResults.length}`);
    console.log(`✅ Campaigns created: ${campaignResults.length}`);
    console.log('\n🎉 All tests completed successfully without external APIs!');

    // Export results
    const testResults = {
      competitors: competitorResults,
      reviews: reviewResults,
      icps: icpResults,
      campaigns: campaignResults,
      timestamp: new Date().toISOString(),
    };

    console.log('\n💾 Test results available for export');
    console.log('📊 Data structure:', Object.keys(testResults));

    return testResults;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Quick test function
async function runQuickTest() {
  console.log('\n⚡ Running quick test with predefined data...\n');

  try {
    await simulateAPIDelay(1000);

    const results = {
      competitors: mockCompetitors,
      reviews: mockReviews,
      icps: [
        {
          id: 'icp_1',
          name: 'Tech-savvy Marketing Managers',
          confidence: 85,
        },
      ],
      campaigns: [
        {
          title: 'Quick Test Campaign',
          adCopy: 'Test campaign generated successfully!',
          hook: 'Quick test completed',
        },
      ],
    };

    console.log('✅ Quick test completed successfully!');
    console.log(
      `📊 Generated ${results.competitors.length} competitors, ${results.reviews.length} reviews, ${results.icps.length} ICPs, and ${results.campaigns.length} campaigns.`,
    );

    return results;
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    throw error;
  }
}

// Export functions for use in browser
if (typeof window !== 'undefined') {
  window.testAPI = {
    runFullTest,
    runQuickTest,
    mockCompetitors,
    mockReviews,
  };

  console.log('🌐 Test functions available as window.testAPI');
  console.log(
    '💡 Run window.testAPI.runQuickTest() or window.testAPI.runFullTest()',
  );
}

// Run demo if in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runFullTest,
    runQuickTest,
    mockCompetitors,
    mockReviews,
  };

  // Auto-run demo
  runQuickTest().then(() => {
    console.log(
      '\n🎯 Demo completed! Check the application for full functionality.',
    );
  });
}

console.log('\n📖 Usage:');
console.log('1. Open the application in browser');
console.log('2. Go to "Test Mode" tab');
console.log('3. Click "Quick Test" or "Full Test"');
console.log('4. Or run this script in browser console');
console.log('\n🚀 Ready to test!');
