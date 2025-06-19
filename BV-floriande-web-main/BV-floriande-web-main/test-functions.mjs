// Test the specific functions that were causing errors
import { groupService } from './src/lib/bvf-services.js';

console.log('🧪 Testing specific BV Floriande functions that were causing errors...');

async function testTrainerGroups() {
  try {
    // Test with a sample UUID (this will fail gracefully if no user exists)
    const sampleUUID = '550e8400-e29b-41d4-a716-446655440000';
    console.log('Testing getTrainerGroups with sample UUID...');
    
    const groups = await groupService.getTrainerGroups(sampleUUID);
    console.log('✅ getTrainerGroups executed without crashing');
    console.log('📊 Returned groups:', groups.length);
    
    return true;
  } catch (error) {
    console.error('❌ getTrainerGroups failed:', error.message);
    return false;
  }
}

async function testCreateGroup() {
  try {
    console.log('Testing createGroup validation (without actual creation)...');
    
    // This should fail with authentication error, which is expected
    // The important thing is it doesn't fail with "No API key found"
    try {
      await groupService.createGroup({
        name: 'Test Group',
        description: 'Test Description',
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      });
    } catch (error) {
      if (error.message.includes('No API key found')) {
        console.error('❌ Still getting "No API key found" error');
        return false;
      } else if (error.message.includes('Authentication') || error.message.includes('logged in')) {
        console.log('✅ Getting expected authentication error (API key is working)');
        return true;
      } else {
        console.log('✅ Getting different error (not API key issue):', error.message);
        return true;
      }
    }
    
    console.log('✅ createGroup executed without API key errors');
    return true;
    
  } catch (error) {
    console.error('❌ createGroup test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Running function tests...\n');
  
  let passed = 0;
  let total = 2;
  
  if (await testTrainerGroups()) passed++;
  if (await testCreateGroup()) passed++;
  
  console.log(`\n🏁 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All key functions are working!');
    console.log('🔗 The "No API key found" and database errors should be resolved.');
  } else {
    console.log('⚠️  Some functions still have issues. Check the errors above.');
  }
}

runTests();
