// Test script to verify localStorage data format
console.log('🧪 Testing localStorage Data Format');
console.log('==================================\n');

// Test data that should be in localStorage
const testData = {
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

console.log('📋 Test Data Summary:');
console.log(`Company: ${testData.data.name}`);
console.log(`Location: ${testData.data.location}`);
console.log(`Industry: ${testData.data.industry}`);
console.log(`Fields filled: ${Object.keys(testData.data).length}/18`);

console.log('\n🔧 To set this data in your browser:');
console.log('==================================');
console.log('1. Open browser console (F12)');
console.log('2. Run this command:');
console.log(
  '\nlocalStorage.setItem("icp-builder-company-data", \'' +
    JSON.stringify(testData) +
    "');",
);
console.log('\n3. Refresh the page');
console.log('4. Click "Fill with AI" button');

console.log('\n🎯 Expected Behavior:');
console.log('====================');
console.log('- Chatbot should detect existing data');
console.log('- Should show "18/18 fields filled"');
console.log('- Should allow modifying existing fields');
console.log('- Should be ready for ICP generation');

console.log('\n✅ Test data ready! Copy the localStorage command above.');
