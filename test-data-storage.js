// Test script for file-based company data storage
// Run with: node test-data-storage.js

// Import the company data service directly
const { companyDataService } = require('./src/services/company-data-service');

async function testDataStorage() {
  console.log('🧪 Testing File-Based Data Storage');
  console.log('==================================\n');

  try {
    // 1. Set test data
    console.log('1. Setting test data...');
    const testData = {
      name: 'Test Company',
      location: 'Test Location',
      website: 'https://testcompany.com',
      industry: 'Technology',
      companySize: '10-50 employees',
      targetMarket: 'Small businesses',
      valueProposition: 'Affordable tech solutions',
      mainOfferings: 'Web development services',
      pricingModel: 'Subscription-based',
      uniqueFeatures: '24/7 support',
      marketSegment: 'SMB market',
      competitiveAdvantages: 'Lower pricing',
      currentCustomers: '50+ small businesses',
      successStories: 'Increased client revenue by 30%',
      painPointsSolved: 'High development costs',
      customerGoals: 'Digital transformation',
      currentMarketingChannels: 'Social media, email',
      marketingMessaging: 'Affordable tech for small business',
    };

    // Update each field
    for (const [field, value] of Object.entries(testData)) {
      await companyDataService.updateField(field, value);
    }
    console.log('✅ Test data set successfully');

    // 2. View current data
    console.log('\n2. Viewing current data...');
    const data = await companyDataService.getCurrentData();
    const progress = await companyDataService.getCompletionProgress();
    
    console.log('📊 Current Company Data:');
    console.log('========================');
    console.log(`Progress: ${progress.filled}/${progress.total} (${progress.percentage}%)`);
    console.log(`Can Generate ICPs: ${progress.filled >= 5 ? 'Yes' : 'No'}`);
    console.log(`Next Field: ${data.nextField || 'All complete'}`);
    console.log('\nFilled Fields:');
    
    for (const field of data.filledFields) {
      const value = data.currentData[field];
      console.log(`  ${field}: ${value}`);
    }

    // 3. Get status
    console.log('\n3. Getting status...');
    console.log('Status:', {
      progress,
      canGenerateICPs: progress.filled >= 5,
      nextField: data.nextField,
    });

    // 4. Save to file
    console.log('\n4. Saving data to file...');
    await companyDataService.saveToFile();

    // 5. Reset data
    console.log('\n5. Resetting data...');
    await companyDataService.resetData();

    // 6. View empty data
    console.log('\n6. Viewing empty data...');
    const emptyData = await companyDataService.getCurrentData();
    console.log('Empty data fields:', emptyData.filledFields.length);

    // 7. Load data back
    console.log('\n7. Loading data from file...');
    await companyDataService.loadFromFile();

    // 8. View loaded data
    console.log('\n8. Viewing loaded data...');
    const loadedData = await companyDataService.getCurrentData();
    console.log('Loaded data fields:', loadedData.filledFields.length);

    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDataStorage();
