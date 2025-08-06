import type { CompetitorData, CustomerReview, ICP } from '@/services/ai';

// Test data for ICP generation
export const testCompetitorData: CompetitorData[] = [
  {
    name: 'Test Competitor 1',
    website: 'https://example1.com',
    social: 'https://twitter.com/example1',
  },
  {
    name: 'Test Competitor 2',
    website: 'https://example2.com',
    social: 'https://linkedin.com/company/example2',
  },
];

export const testReviewData: CustomerReview[] = [
  {
    text: 'Great product, really helped me solve my problem. The customer service was excellent.',
    source: 'Test Competitor 1',
  },
  {
    text: 'I love this service! The features are exactly what I needed for my business.',
    source: 'Test Competitor 1',
  },
  {
    text: 'Good quality but a bit expensive. Still worth the investment for the features.',
    source: 'Test Competitor 2',
  },
];

export const testAdditionalContext =
  'Target market: Small to medium businesses in the technology sector. Focus on B2B SaaS solutions.';

// Test function to verify ICP generation
export async function testICPGeneration() {
  console.log('🧪 Testing ICP Generation with Ollama...');

  try {
    // Import the AI service
    const { AIService } = await import('@/services/ai');

    // Create AI service instance (will use Ollama when no API key is provided)
    const aiService = new AIService();

    console.log('📊 Test Data:');
    console.log('- Competitors:', testCompetitorData.length);
    console.log('- Reviews:', testReviewData.length);
    console.log('- Additional Context:', testAdditionalContext ? 'Yes' : 'No');
    console.log('- Using: Ollama (local LLM)');

    // Generate ICPs
    console.log('🚀 Generating ICPs with Ollama...');
    const startTime = Date.now();

    const generatedICPs = await aiService.generateICPs(
      testCompetitorData,
      testReviewData,
      testAdditionalContext,
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('✅ ICP Generation Results:');
    console.log(`- Time taken: ${duration}ms`);
    console.log(`- ICPs generated: ${generatedICPs.length}`);

    // Validate ICP structure
    generatedICPs.forEach((icp, index) => {
      console.log(`\n📋 ICP ${index + 1}: ${icp.name}`);
      console.log(`- Description: ${icp.description.substring(0, 100)}...`);
      console.log(
        `- Demographics: ${icp.demographics.age}, ${icp.demographics.gender}, ${icp.demographics.location}`,
      );
      console.log(`- Interests: ${icp.psychographics.interests.length} items`);
      console.log(
        `- Pain Points: ${icp.psychographics.painPoints.length} items`,
      );
      console.log(`- Goals: ${icp.goals.length} items`);
      console.log(`- Challenges: ${icp.challenges.length} items`);

      // Validate structure
      const isValid = validateICPStructure(icp);
      console.log(`- Structure valid: ${isValid ? '✅' : '❌'}`);
    });

    return {
      success: true,
      icps: generatedICPs,
      duration,
      message: `Successfully generated ${generatedICPs.length} ICPs with Ollama in ${duration}ms`,
    };
  } catch (error) {
    console.error('❌ ICP Generation Test Failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message:
        'Failed to generate ICPs. Make sure Ollama is running and llama3.2:3b model is installed.',
    };
  }
}

// Function to validate ICP structure
export function validateICPStructure(icp: ICP): boolean {
  const requiredFields = [
    'name',
    'description',
    'demographics',
    'psychographics',
    'behavior',
    'goals',
    'challenges',
    'preferredChannels',
  ];

  const requiredDemographics = [
    'age',
    'gender',
    'location',
    'income',
    'education',
  ];
  const requiredPsychographics = [
    'interests',
    'values',
    'lifestyle',
    'painPoints',
  ];
  const requiredBehavior = [
    'onlineHabits',
    'purchasingBehavior',
    'brandPreferences',
  ];

  // Check main fields
  for (const field of requiredFields) {
    if (!(field in icp)) {
      console.error(`❌ Missing required field: ${field}`);
      return false;
    }
  }

  // Check demographics
  for (const field of requiredDemographics) {
    if (!(field in icp.demographics)) {
      console.error(`❌ Missing demographics field: ${field}`);
      return false;
    }
  }

  // Check psychographics
  for (const field of requiredPsychographics) {
    if (!(field in icp.psychographics)) {
      console.error(`❌ Missing psychographics field: ${field}`);
      return false;
    }
  }

  // Check behavior
  for (const field of requiredBehavior) {
    if (!(field in icp.behavior)) {
      console.error(`❌ Missing behavior field: ${field}`);
      return false;
    }
  }

  console.log('✅ ICP structure validation passed');
  return true;
}
