// Script to populate localStorage with test profile data
// This will be used to set up the test data in the browser

const testProfile = {
  user_id: 'test-user-123',
  data: {
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
  lastUpdated: new Date().toISOString(),
  version: '1.0',
};

console.log('🏢 Test Profile for localStorage');
console.log('===============================\n');

console.log('📋 Profile Summary:');
console.log(`Company: ${testProfile.data.name}`);
console.log(`Location: ${testProfile.data.location}`);
console.log(`Industry: ${testProfile.data.industry}`);
console.log(`Size: ${testProfile.data.companySize}`);
console.log(`Target Market: ${testProfile.data.targetMarket}`);
console.log(`Website: ${testProfile.data.website}`);

console.log('\n📊 Completion Status:');
console.log(`Fields filled: ${Object.keys(testProfile.data).length}/18`);
console.log(
  `Completion: ${Math.round(
    (Object.keys(testProfile.data).length / 18) * 100,
  )}%`,
);
console.log('✅ Profile is complete!');

console.log('\n🔧 To populate localStorage in your browser:');
console.log('==========================================');
console.log("1. Open your browser's Developer Tools (F12)");
console.log('2. Go to the Console tab');
console.log('3. Copy and paste this command:');
console.log(
  '\nlocalStorage.setItem("icp-builder-company-data", JSON.stringify(' +
    JSON.stringify(testProfile, null, 2) +
    '));',
);
console.log('\n4. Press Enter');
console.log('5. Refresh the page');
console.log('6. Click "Fill with AI" button');
console.log('7. The chatbot should now see the complete profile!');

console.log('\n🎯 Alternative: Run this in browser console:');
console.log('==========================================');
console.log(
  'localStorage.setItem("icp-builder-company-data", \'' +
    JSON.stringify(testProfile) +
    "');",
);
console.log('location.reload();');

console.log(
  '\n✅ Ready to test! The chatbot should now detect the existing profile.',
);
