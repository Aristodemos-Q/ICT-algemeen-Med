import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

console.log('Starting test...');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment variables loaded:', {
  url: supabaseUrl ? 'Set' : 'Not set',
  key: supabaseKey ? 'Set' : 'Not set'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase client created');

// Test basic connection first
async function testConnection() {
  console.log('Testing basic connection...');
  
  try {
    const { data, error } = await supabase.from('groups').select('id').limit(1);
    
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    
    console.log('Connection successful. Sample data:', data);
    return true;
  } catch (error) {
    console.error('Connection exception:', error);
    return false;
  }
}

// Test trainer groups query with various scenarios
async function testTrainerGroups() {
  console.log('\nTesting trainer groups query...');
  
  try {
    // Test 1: Check if group_trainers table exists
    console.log('1. Checking group_trainers table...');
    const { data: trainersData, error: trainersError } = await supabase
      .from('group_trainers')
      .select('*')
      .limit(5);
    
    if (trainersError) {
      console.error('group_trainers table error:', {
        message: trainersError.message,
        details: trainersError.details,
        hint: trainersError.hint,
        code: trainersError.code
      });
    } else {
      console.log('group_trainers table data:', trainersData);
    }
    
    // Test 2: Test with null/undefined trainer ID
    console.log('\n2. Testing with null trainer ID...');
    const { data: nullData, error: nullError } = await supabase
      .from('group_trainers')
      .select(`
        groups!group_trainers_group_id_fkey(*)
      `)
      .eq('trainer_id', null);

    if (nullError) {
      console.error('Null trainer ID error:', {
        message: nullError.message,
        details: nullError.details,
        hint: nullError.hint,
        code: nullError.code
      });
    } else {
      console.log('Null trainer ID result:', nullData);
    }
    
    // Test 3: Test with fake trainer ID
    console.log('\n3. Testing with fake trainer ID...');
    const { data: fakeData, error: fakeError } = await supabase
      .from('group_trainers')
      .select(`
        groups!group_trainers_group_id_fkey(*)
      `)
      .eq('trainer_id', 'fake-trainer-id');

    if (fakeError) {
      console.error('Fake trainer ID error:', {
        message: fakeError.message,
        details: fakeError.details,
        hint: fakeError.hint,
        code: fakeError.code
      });
    } else {
      console.log('Fake trainer ID result:', fakeData);
    }
    
    // Test 4: Check if groups table exists
    console.log('\n4. Checking groups table...');
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .limit(5);
    
    if (groupsError) {
      console.error('groups table error:', {
        message: groupsError.message,
        details: groupsError.details,
        hint: groupsError.hint,
        code: groupsError.code
      });
    } else {
      console.log('groups table data:', groupsData);
    }
    
    return true;
    
  } catch (error) {
    console.error('Exception in testTrainerGroups:', {
      error: error,
      message: error.message,
      stack: error.stack,
      type: typeof error,
      stringified: JSON.stringify(error, null, 2)
    });
    return false;
  }
}

testConnection().then((success) => {
  if (success) {
    console.log('✅ Connection test passed');
    return testTrainerGroups();
  } else {
    console.log('❌ Connection test failed');
    return false;
  }
}).then((success) => {
  if (success) {
    console.log('✅ Trainer groups test passed');
  } else {
    console.log('❌ Trainer groups test failed');
  }
  process.exit(0);
}).catch((error) => {
  console.error('Test failed with exception:', error);
  process.exit(1);
});
