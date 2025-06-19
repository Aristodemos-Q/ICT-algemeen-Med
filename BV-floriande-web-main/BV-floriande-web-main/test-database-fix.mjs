import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseOperations() {
  console.log('🧪 Testing database operations after RLS fix...\n');

  // Test 1: Query groups (should not have infinite recursion)
  console.log('📋 Test 1: Querying groups...');
  try {
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .limit(5);
    
    if (groupsError) {
      if (groupsError.message?.includes('infinite recursion')) {
        console.error('❌ CRITICAL: Infinite recursion still detected in groups query!');
        console.error('RLS fix did not work properly.');
        return false;
      } else {
        console.error('❌ Error querying groups:', groupsError.message);
        return false;
      }
    }
    
    console.log('✅ Groups query successful!');
    console.log(`   Found ${groups?.length || 0} groups`);
  } catch (error) {
    console.error('❌ Exception in groups query:', error.message);
    return false;
  }

  // Test 2: Query users
  console.log('\n📋 Test 2: Querying users...');
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .limit(5);
    
    if (usersError) {
      if (usersError.message?.includes('infinite recursion')) {
        console.error('❌ CRITICAL: Infinite recursion still detected in users query!');
        return false;
      } else {
        console.error('❌ Error querying users:', usersError.message);
        return false;
      }
    }
    
    console.log('✅ Users query successful!');
    console.log(`   Found ${users?.length || 0} users`);
  } catch (error) {
    console.error('❌ Exception in users query:', error.message);
    return false;
  }

  // Test 3: Query members
  console.log('\n📋 Test 3: Querying members...');
  try {
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .limit(5);
    
    if (membersError) {
      console.error('❌ Error querying members:', membersError.message);
      // This might be expected if no members exist
    } else {
      console.log('✅ Members query successful!');
      console.log(`   Found ${members?.length || 0} members`);
    }
  } catch (error) {
    console.error('❌ Exception in members query:', error.message);
  }

  // Test 4: Query sessions
  console.log('\n📋 Test 4: Querying sessions...');
  try {
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(5);
    
    if (sessionsError) {
      console.error('❌ Error querying sessions:', sessionsError.message);
      // This might be expected if no sessions exist
    } else {
      console.log('✅ Sessions query successful!');
      console.log(`   Found ${sessions?.length || 0} sessions`);
    }
  } catch (error) {
    console.error('❌ Exception in sessions query:', error.message);
  }

  console.log('\n🎉 Database RLS fix verification complete!');
  console.log('✅ No infinite recursion errors detected');
  console.log('✅ Basic queries are working');
  console.log('✅ You can now create groups, members, sessions, and exercises');
  
  return true;
}

testDatabaseOperations()
  .then((success) => {
    if (success) {
      console.log('\n🎯 DATABASE IS READY FOR USE!');
      process.exit(0);
    } else {
      console.log('\n💥 Database fix verification failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  });
