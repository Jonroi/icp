// Test script for company selector functionality
const fs = require('fs');
const path = require('path');

// Read the test companies data
const testCompaniesPath = path.join(
  __dirname,
  'public',
  'test-companies-data.json',
);
const testCompaniesData = JSON.parse(
  fs.readFileSync(testCompaniesPath, 'utf8'),
);

console.log('🧪 Testing Company Selector Functionality');
console.log('==========================================');

// Test 1: Check if test companies data is loaded correctly
console.log('\n1. Test Companies Data:');
testCompaniesData.companies.forEach((company, index) => {
  console.log(`   ${index + 1}. ${company.name} (${company.industry})`);
  console.log(`      Location: ${company.location}`);
  console.log(`      Size: ${company.companySize}`);
  console.log(`      Website: ${company.website}`);
  console.log('');
});

// Test 2: Verify all required fields are present
console.log('2. Field Validation:');
const requiredFields = [
  'name',
  'location',
  'website',
  'social',
  'industry',
  'companySize',
  'targetMarket',
  'valueProposition',
  'mainOfferings',
  'pricingModel',
  'uniqueFeatures',
  'marketSegment',
  'competitiveAdvantages',
  'currentCustomers',
  'successStories',
  'painPointsSolved',
  'customerGoals',
  'currentMarketingChannels',
  'marketingMessaging',
];

testCompaniesData.companies.forEach((company, index) => {
  console.log(`   Company ${index + 1} (${company.name}):`);
  const missingFields = requiredFields.filter((field) => !company[field]);

  if (missingFields.length === 0) {
    console.log(`   ✅ All required fields present`);
  } else {
    console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
  }
});

// Test 3: Check data consistency
console.log('\n3. Data Consistency:');
testCompaniesData.companies.forEach((company, index) => {
  console.log(`   Company ${index + 1} (${company.name}):`);
  console.log(`   - Industry: ${company.industry}`);
  console.log(`   - Target Market: ${company.targetMarket}`);
  console.log(
    `   - Value Proposition: ${company.valueProposition.substring(0, 50)}...`,
  );
  console.log(
    `   - Main Offerings: ${company.mainOfferings.substring(0, 50)}...`,
  );
  console.log('');
});

console.log('✅ Company Selector Test Complete!');
console.log('\nTo test the functionality:');
console.log('1. Start the development server: npm run dev');
console.log('2. Open http://localhost:3000');
console.log('3. Go to the ICP Generator tab');
console.log('4. Use the "Test Company" dropdown to switch between companies');
console.log('5. Verify that all form fields are populated correctly');
