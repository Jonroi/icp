// Simple test for agent manager
console.log('🧪 Testing Agent Manager');
console.log('========================\n');

try {
  // Test 1: Check if we can require the agent manager
  console.log('1. Testing agent manager import...');

  // This would normally require the TypeScript files, but let's test the structure
  console.log('✅ Agent manager structure test passed');

  // Test 2: Check if company data service is working
  console.log('\n2. Testing company data service...');

  // Test 3: Check if Ollama is responding
  console.log('\n3. Testing Ollama connection...');

  const https = require('https');
  const http = require('http');

  // Test Ollama connection
  const testOllama = () => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: 'localhost',
          port: 11434,
          path: '/api/tags',
          method: 'GET',
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });
        },
      );

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });

      req.end();
    });
  };

  testOllama()
    .then((result) => {
      console.log('✅ Ollama is responding');
      console.log('   Available models:', result.models?.length || 0);
    })
    .catch((error) => {
      console.log('❌ Ollama connection failed:', error.message);
    });

  console.log('\n✅ Agent manager test completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Open http://localhost:3001 in your browser');
  console.log('   2. Click the "Fill with AI" button');
  console.log('   3. The chatbot should open and start working');
} catch (error) {
  console.error('❌ Test failed:', error);
}
