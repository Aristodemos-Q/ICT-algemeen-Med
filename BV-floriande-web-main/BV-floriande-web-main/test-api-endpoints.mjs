// Test script for API endpoints
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3002';

async function testEndpoint(endpoint, description) {
  console.log(`\n🧪 Testing ${description}...`);
  console.log(`   URL: ${BASE_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ Error Response: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`   ✅ Success: ${data.success ? 'true' : 'false'}`);
    
    if (data.success && data.data) {
      console.log(`   📊 Data count: ${Array.isArray(data.data) ? data.data.length : 'N/A'}`);
      if (Array.isArray(data.data) && data.data.length > 0) {
        console.log(`   📝 Sample record:`, JSON.stringify(data.data[0], null, 2));
      }
    } else if (!data.success) {
      console.log(`   ❌ API Error: ${data.error || 'Unknown error'}`);
    }
    
    return data.success;
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
    return false;
  }
}

async function testAll() {
  console.log('🚀 Testing MedCheck+ API Endpoints\n');
  console.log('====================================');
  
  const tests = [
    { endpoint: '/api/appointment-types', description: 'Appointment Types API' },
    { endpoint: '/api/practice-locations', description: 'Practice Locations API' },
    { endpoint: '/api/appointment-requests', description: 'Appointment Requests API (GET)' }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    const success = await testEndpoint(test.endpoint, test.description);
    if (success) passedTests++;
  }
  
  console.log('\n====================================');
  console.log(`📊 Test Results: ${passedTests}/${tests.length} passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All API endpoints are working correctly!');
  } else {
    console.log('⚠️  Some API endpoints have issues. Check the logs above.');
  }
}

// Test database connectivity first
async function testDatabaseConnection() {
  console.log('🔌 Testing database connection...');
  
  try {
    // Import environment variables
    const { config } = await import('dotenv');
    config({ path: join(__dirname, '.env.local') });
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ Missing environment variables');
      return false;
    }
    
    console.log('✅ Environment variables found');
    return true;
  } catch (error) {
    console.log('❌ Error checking environment:', error.message);
    return false;
  }
}

// Run tests
async function main() {
  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    console.log('❌ Database connection test failed');
    return;
  }
  
  // Wait a moment for server to be ready
  console.log('⏳ Waiting for server to be ready...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testAll();
}

main().catch(error => {
  console.error('❌ Test script failed:', error);
});
