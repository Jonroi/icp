// Debug script to test data loading
const fs = require('fs').promises;

async function debugDataLoading() {
  console.log('🔍 Debugging Data Loading');
  console.log('=========================\n');

  try {
    // Test 1: Check if file exists
    console.log('1. Checking if company-data.json exists...');
    try {
      const stats = await fs.stat('./company-data.json');
      console.log(`✅ File exists, size: ${stats.size} bytes`);
    } catch (error) {
      console.log('❌ File does not exist:', error.message);
      return;
    }

    // Test 2: Read and parse the file
    console.log('\n2. Reading company-data.json...');
    const fileContent = await fs.readFile('./company-data.json', 'utf-8');
    console.log('✅ File read successfully');
    console.log(`   Content length: ${fileContent.length} characters`);

    // Test 3: Parse JSON
    console.log('\n3. Parsing JSON...');
    const parsed = JSON.parse(fileContent);
    console.log('✅ JSON parsed successfully');

    // Test 4: Check data structure
    console.log('\n4. Analyzing data structure...');
    console.log(`   User ID: ${parsed.user_id}`);
    console.log(`   Data rows: ${parsed.data_rows?.length || 0}`);
    console.log(`   Has legacy_data: ${!!parsed.legacy_data}`);
    console.log(`   Version: ${parsed.version}`);

    // Test 5: Check legacy data
    if (parsed.legacy_data) {
      console.log('\n5. Legacy data fields:');
      const legacyFields = Object.keys(parsed.legacy_data);
      console.log(`   Total fields: ${legacyFields.length}`);
      legacyFields.forEach((field) => {
        const value = parsed.legacy_data[field];
        console.log(`   ${field}: ${value}`);
      });
    }

    // Test 6: Check data rows
    if (parsed.data_rows && Array.isArray(parsed.data_rows)) {
      console.log('\n6. Data rows:');
      console.log(`   Total rows: ${parsed.data_rows.length}`);
      parsed.data_rows.forEach((row) => {
        console.log(`   ${row.field_name}: ${row.field_value}`);
      });
    }

    // Test 7: Simulate the loading logic
    console.log('\n7. Simulating loading logic...');
    let loadedData = {};

    if (parsed.data_rows && Array.isArray(parsed.data_rows)) {
      // New PostgreSQL-ready format
      for (const row of parsed.data_rows) {
        loadedData[row.field_name] = row.field_value;
      }
      console.log('✅ Loaded from data_rows format');
    } else if (parsed.legacy_data) {
      // Legacy format
      loadedData = parsed.legacy_data;
      console.log('✅ Loaded from legacy_data format');
    } else if (parsed.data) {
      // Old format
      loadedData = parsed.data;
      console.log('✅ Loaded from data format');
    }

    console.log(`   Loaded fields: ${Object.keys(loadedData).length}`);
    Object.entries(loadedData).forEach(([field, value]) => {
      console.log(`   ${field}: ${value}`);
    });

    console.log('\n✅ Debug completed successfully!');
    console.log('\n📝 The data should be loaded correctly by the service.');
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugDataLoading();
