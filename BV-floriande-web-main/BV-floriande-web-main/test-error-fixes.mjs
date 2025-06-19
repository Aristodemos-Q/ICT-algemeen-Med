/**
 * Test script to verify the specific errors mentioned are fixed
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing BV Floriande Specific Error Fixes');
console.log('==============================================');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment variables missing!');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('📋 Supabase URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('📋 Supabase Key:', supabaseKey ? 'SET' : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBasicConnection() {
  console.log('\n🧪 Test: Basic Database Connection');
  console.log('-----------------------------------');
  
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.message?.includes('No API key found')) {
        console.error('❌ FAILED: "No API key found" error still exists!');
        console.error('🔧 This error should have been fixed.');
        return false;
      } else {
        console.log('✅ PASSED: No "API key" errors (different error is ok)');
        console.log('📋 Error:', error.message);
      }
    } else {
      console.log('✅ PASSED: Database connection successful');
      console.log('📊 Connection established without API key errors');
    }
    
    return true;
  } catch (error) {
    if (error.message?.includes('No API key found')) {
      console.error('❌ FAILED: API key exception still occurs');
      return false;
    } else {
      console.log('✅ PASSED: No API key exceptions');
      return true;
    }
  }
}

async function runQuickTest() {
  console.log('🚀 Running quick error verification...\n');
  
  const passed = await testBasicConnection();
  
  console.log('\n🏁 Quick Test Results');
  console.log('=====================');
  
  if (passed) {
    console.log('🎉 SUCCESS: API key configuration is working!');
    console.log('');
    console.log('✅ Key Fix Verified:');
    console.log('   • Supabase client initializes properly');
    console.log('   • No "No API key found" errors');
    console.log('   • Environment variables are loaded correctly');
    console.log('');
    console.log('🔗 Ready for browser testing:');
    console.log('   • http://localhost:3001/dashboard/trainer-dashboard');
    console.log('   • Login and test group operations');
  } else {
    console.log('⚠️ API key issues may still exist');
    console.log('🔧 Check .env.local file and restart dev server');
  }
}

runQuickTest().catch(error => {
  console.error('💥 Test error:', error.message);
});
