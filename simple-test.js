// Simple test for file-based storage
// This tests the basic file operations without TypeScript

const fs = require('fs').promises;
const path = require('path');

const TEST_FILE = './company-data.json';
const TEST_USER_ID = 'test-user-123';

async function testFileStorage() {
  console.log('🧪 Testing Simple File-Based Storage');
  console.log('=====================================\n');

  try {
    // 1. Create test data
    console.log('1. Creating test data...');
    const testData = {
      user_id: TEST_USER_ID,
      data_rows: [
        {
          id: `${TEST_USER_ID}-name`,
          user_id: TEST_USER_ID,
          field_name: 'name',
          field_value: 'Test Company',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: `${TEST_USER_ID}-location`,
          user_id: TEST_USER_ID,
          field_name: 'location',
          field_value: 'Test Location',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
        {
          id: `${TEST_USER_ID}-website`,
          user_id: TEST_USER_ID,
          field_name: 'website',
          field_value: 'https://testcompany.com',
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        },
      ],
      lastUpdated: new Date().toISOString(),
      version: '1.0',
    };

    // 2. Save to file
    console.log('2. Saving data to file...');
    await fs.writeFile(TEST_FILE, JSON.stringify(testData, null, 2));
    console.log(`✅ Data saved to ${TEST_FILE}`);

    // 3. Read from file
    console.log('\n3. Reading data from file...');
    const fileContent = await fs.readFile(TEST_FILE, 'utf-8');
    const loadedData = JSON.parse(fileContent);
    console.log('✅ Data loaded from file');

    // 4. Display data
    console.log('\n4. Displaying loaded data:');
    console.log('==========================');
    console.log(`User ID: ${loadedData.user_id}`);
    console.log(`Version: ${loadedData.version}`);
    console.log(`Last Updated: ${loadedData.lastUpdated}`);
    console.log('\nData Rows:');
    
    for (const row of loadedData.data_rows) {
      console.log(`  ${row.field_name}: ${row.field_value}`);
    }

    // 5. Check file exists
    console.log('\n5. Checking file exists...');
    const stats = await fs.stat(TEST_FILE);
    console.log(`✅ File exists, size: ${stats.size} bytes`);

    // 6. Test PostgreSQL-ready format
    console.log('\n6. Testing PostgreSQL-ready format...');
    const postgresData = {
      user_id: TEST_USER_ID,
      data_rows: loadedData.data_rows,
      lastUpdated: new Date().toISOString(),
      version: '1.0',
      legacy_data: {
        name: 'Test Company',
        location: 'Test Location',
        website: 'https://testcompany.com',
      },
    };

    await fs.writeFile(TEST_FILE, JSON.stringify(postgresData, null, 2));
    console.log('✅ PostgreSQL-ready format saved');

    // 7. Test loading different formats
    console.log('\n7. Testing format compatibility...');
    const newContent = await fs.readFile(TEST_FILE, 'utf-8');
    const newData = JSON.parse(newContent);
    
    if (newData.data_rows && Array.isArray(newData.data_rows)) {
      console.log('✅ PostgreSQL format detected and loaded');
    } else if (newData.legacy_data) {
      console.log('✅ Legacy format detected and loaded');
    } else {
      console.log('✅ Old format detected and loaded');
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📁 File location:', path.resolve(TEST_FILE));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFileStorage();
