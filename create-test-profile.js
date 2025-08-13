// Create a comprehensive test profile for the chatbot
const fs = require('fs').promises;

async function createTestProfile() {
  console.log('🏢 Creating Test Company Profile');
  console.log('================================\n');

  try {
    // Comprehensive test company data
    const testProfile = {
      user_id: 'test-user-123',
      data_rows: [
        {
          id: 'test-user-123-name',
          user_id: 'test-user-123',
          field_name: 'name',
          field_value: 'TechFlow Solutions',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-location',
          user_id: 'test-user-123',
          field_name: 'location',
          field_value: 'North America',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-website',
          user_id: 'test-user-123',
          field_name: 'website',
          field_value: 'https://techflowsolutions.com',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-industry',
          user_id: 'test-user-123',
          field_name: 'industry',
          field_value: 'Software Development',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-companySize',
          user_id: 'test-user-123',
          field_name: 'companySize',
          field_value: '25-50 employees',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-targetMarket',
          user_id: 'test-user-123',
          field_name: 'targetMarket',
          field_value: 'Small to medium businesses',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-valueProposition',
          user_id: 'test-user-123',
          field_name: 'valueProposition',
          field_value:
            'Affordable custom software solutions with rapid delivery',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-mainOfferings',
          user_id: 'test-user-123',
          field_name: 'mainOfferings',
          field_value:
            'Custom web applications, mobile apps, and business automation tools',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-pricingModel',
          user_id: 'test-user-123',
          field_name: 'pricingModel',
          field_value: 'Project-based pricing with flexible payment plans',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-uniqueFeatures',
          user_id: 'test-user-123',
          field_name: 'uniqueFeatures',
          field_value:
            '2-week MVP delivery, ongoing support, and agile development process',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-marketSegment',
          user_id: 'test-user-123',
          field_name: 'marketSegment',
          field_value: 'SMBs in retail, healthcare, and professional services',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-competitiveAdvantages',
          user_id: 'test-user-123',
          field_name: 'competitiveAdvantages',
          field_value:
            'Lower costs than enterprise solutions, faster delivery, personalized service',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-currentCustomers',
          user_id: 'test-user-123',
          field_name: 'currentCustomers',
          field_value:
            '15+ small businesses, 3 healthcare clinics, 2 retail chains',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-successStories',
          user_id: 'test-user-123',
          field_name: 'successStories',
          field_value:
            'Helped a retail chain increase online sales by 40% with custom e-commerce platform',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-painPointsSolved',
          user_id: 'test-user-123',
          field_name: 'painPointsSolved',
          field_value:
            'High software development costs, long development cycles, lack of customization',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-customerGoals',
          user_id: 'test-user-123',
          field_name: 'customerGoals',
          field_value:
            'Digital transformation, operational efficiency, competitive advantage',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-currentMarketingChannels',
          user_id: 'test-user-123',
          field_name: 'currentMarketingChannels',
          field_value: 'LinkedIn, Google Ads, referrals, industry conferences',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: 'test-user-123-marketingMessaging',
          user_id: 'test-user-123',
          field_name: 'marketingMessaging',
          field_value:
            'Transform your business with custom software solutions that fit your budget and timeline',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
      ],
      lastUpdated: new Date().toISOString(),
      version: '1.0',
      legacy_data: {
        name: 'TechFlow Solutions',
        location: 'North America',
        website: 'https://techflowsolutions.com',
        industry: 'Software Development',
        companySize: '25-50 employees',
        targetMarket: 'Small to medium businesses',
        valueProposition:
          'Affordable custom software solutions with rapid delivery',
        mainOfferings:
          'Custom web applications, mobile apps, and business automation tools',
        pricingModel: 'Project-based pricing with flexible payment plans',
        uniqueFeatures:
          '2-week MVP delivery, ongoing support, and agile development process',
        marketSegment: 'SMBs in retail, healthcare, and professional services',
        competitiveAdvantages:
          'Lower costs than enterprise solutions, faster delivery, personalized service',
        currentCustomers:
          '15+ small businesses, 3 healthcare clinics, 2 retail chains',
        successStories:
          'Helped a retail chain increase online sales by 40% with custom e-commerce platform',
        painPointsSolved:
          'High software development costs, long development cycles, lack of customization',
        customerGoals:
          'Digital transformation, operational efficiency, competitive advantage',
        currentMarketingChannels:
          'LinkedIn, Google Ads, referrals, industry conferences',
        marketingMessaging:
          'Transform your business with custom software solutions that fit your budget and timeline',
      },
    };

    // Save to data/company-data.json
    console.log('1. Creating comprehensive test profile...');
    await fs.writeFile(
      './data/company-data.json',
      JSON.stringify(testProfile, null, 2),
    );
    console.log('✅ Test profile saved to data/company-data.json');

    // Display profile summary
    console.log('\n2. Test Profile Summary:');
    console.log('========================');
    console.log(`Company: ${testProfile.legacy_data.name}`);
    console.log(`Location: ${testProfile.legacy_data.location}`);
    console.log(`Industry: ${testProfile.legacy_data.industry}`);
    console.log(`Size: ${testProfile.legacy_data.companySize}`);
    console.log(`Target Market: ${testProfile.legacy_data.targetMarket}`);
    console.log(`Website: ${testProfile.legacy_data.website}`);

    // Show completion status
    console.log('\n3. Profile Completion Status:');
    console.log('=============================');
    console.log(`Fields filled: ${testProfile.data_rows.length}/18`);
    console.log(
      `Completion: ${Math.round((testProfile.data_rows.length / 18) * 100)}%`,
    );
    console.log('✅ Profile is complete and ready for ICP generation');

    // Show what the chatbot will see
    console.log('\n4. What the Chatbot Will See:');
    console.log('============================');
    console.log('When you open the chatbot, it will:');
    console.log('- Detect that all 18 fields are already filled');
    console.log('- Show completion status: 18/18 (100%)');
    console.log('- Allow you to modify any field if needed');
    console.log('- Be ready to generate ICPs immediately');

    console.log('\n✅ Test profile created successfully!');
    console.log('\n🎯 Next steps:');
    console.log('1. Open http://localhost:3001 in your browser');
    console.log('2. Click "Fill with AI" button');
    console.log('3. The chatbot will see the complete profile');
    console.log('4. You can test modifying fields or generating ICPs');
  } catch (error) {
    console.error('❌ Failed to create test profile:', error);
  }
}

// Run the script
createTestProfile();
