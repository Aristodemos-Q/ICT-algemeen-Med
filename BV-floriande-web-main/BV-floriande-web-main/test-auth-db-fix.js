/**
 * Comprehensive test script to verify authentication and database fixes
 * Run this with: node test-auth-db-fix.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Testing BV Floriande Authentication and Database Fixes');
console.log('======================================================');

// Test 1: Environment Variables
console.log('\n📋 Test 1: Environment Variables');
console.log('----------------------------------');
console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : '❌ MISSING');
console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : '❌ MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ FAILED: Missing environment variables');
  process.exit(1);
}

// Test 2: Supabase Client Creation
console.log('\n🔧 Test 2: Supabase Client Creation');
console.log('-------------------------------------');
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ PASSED: Supabase client created successfully');
} catch (error) {
  console.error('❌ FAILED: Could not create Supabase client:', error.message);
  process.exit(1);
}

// Test 3: Database Connection
async function testDatabaseConnection() {
  console.log('\n🔗 Test 3: Database Connection');
  console.log('-------------------------------');
  
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ FAILED: Database connection error:', error.message);
      
      // Check for specific API key errors
      if (error.message?.includes('No API key found') || error.message?.includes('Invalid API key')) {
        console.error('🔑 API KEY ERROR: Check your .env.local file');
        return false;
      }
      
      return false;
    }
    
    console.log('✅ PASSED: Database connection successful');
    console.log(`📊 Groups table has ${data?.length || 0} rows`);
    return true;
  } catch (error) {
    console.error('❌ FAILED: Database connection exception:', error.message);
    return false;
  }
}

// Test 4: Authentication System
async function testAuthenticationSystem() {
  console.log('\n🔐 Test 4: Authentication System');
  console.log('----------------------------------');
  
  try {
    // Test getting current session (should be null for server-side)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ FAILED: Session retrieval error:', sessionError.message);
      return false;
    }
    
    console.log('✅ PASSED: Auth system accessible');
    console.log('📋 Current session:', sessionData.session ? 'Active' : 'None (expected for server-side)');
    return true;
  } catch (error) {
    console.error('❌ FAILED: Authentication system exception:', error.message);
    return false;
  }
}

// Test 5: Database Service Functions
async function testDatabaseServices() {
  console.log('\n🛠️ Test 5: Database Service Functions');
  console.log('---------------------------------------');
  
  try {
    // Test groups query (should work without authentication for read operations)
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, description')
      .limit(5);
    
    if (groupsError) {
      console.error('❌ FAILED: Groups query error:', groupsError.message);
      
      // Check for RLS infinite recursion
      if (groupsError.message?.includes('infinite recursion')) {
        console.error('🔥 CRITICAL: RLS infinite recursion detected!');
        console.error('📋 SOLUTION: Apply RLS fix from RLS-FIX-MANUAL-INSTRUCTIONS.md');
        return false;
      }
      
      return false;
    }
    
    console.log('✅ PASSED: Groups query successful');
    console.log(`📊 Retrieved ${groups?.length || 0} groups`);
    
    // Test users query (may require authentication)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(5);
    
    if (usersError) {
      console.log('⚠️  Users query failed (expected without authentication):', usersError.message);
    } else {
      console.log('✅ PASSED: Users query successful');
      console.log(`📊 Retrieved ${users?.length || 0} users`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ FAILED: Database services exception:', error.message);
    return false;
  }
}

// Test 6: Error Handling
async function testErrorHandling() {
  console.log('\n⚠️ Test 6: Error Handling');
  console.log('---------------------------');
  
  try {
    // Intentionally make a bad query to test error handling
    const { data, error } = await supabase
      .from('non_existent_table')
      .select('*');
    
    if (error) {
      console.log('✅ PASSED: Error handling working (expected error for non-existent table)');
      console.log('📋 Error message:', error.message);
      return true;
    } else {
      console.error('❌ FAILED: Expected error for non-existent table but got success');
      return false;
    }
  } catch (error) {
    console.log('✅ PASSED: Exception handling working');
    console.log('📋 Exception message:', error.message);
    return true;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive test suite...\n');
  
  let allPassed = true;
  
  // Test database connection
  if (!await testDatabaseConnection()) {
    allPassed = false;
  }
  
  // Test authentication system
  if (!await testAuthenticationSystem()) {
    allPassed = false;
  }
  
  // Test database services
  if (!await testDatabaseServices()) {
    allPassed = false;
  }
  
  // Test error handling
  if (!await testErrorHandling()) {
    allPassed = false;
  }
  
  // Final results
  console.log('\n🏁 Test Results Summary');
  console.log('========================');
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Authentication and database fixes are working.');
    console.log('✅ You can now test the application in the browser:');
    console.log('   🌐 http://localhost:3001');
    console.log('   👤 Try logging in and accessing the trainer dashboard');
  } else {
    console.log('❌ SOME TESTS FAILED. Please review the errors above.');
    console.log('🔧 Common fixes:');
    console.log('   1. Check .env.local file exists and has correct values');
    console.log('   2. Restart the development server');
    console.log('   3. Apply RLS fixes if infinite recursion detected');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Test login functionality in browser');
  console.log('   2. Test trainer dashboard group creation');
  console.log('   3. Check for remaining "Error fetching trainer groups" messages');
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test suite crashed:', error.message);
  process.exit(1);
});
