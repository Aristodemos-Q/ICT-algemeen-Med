import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

console.log('Testing group operations...');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment check:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseKey ? 'Set' : 'Missing'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGroupOperations() {
  try {
    console.log('\n1. Testing getAllGroups...');
    
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (groupsError) {
      console.error('Groups query error:', {
        message: groupsError.message,
        details: groupsError.details,
        hint: groupsError.hint,
        code: groupsError.code,
        full: JSON.stringify(groupsError, null, 2)
      });
    } else {
      console.log('Groups query successful:', {
        count: groupsData?.length || 0,
        data: groupsData?.slice(0, 2) // Show first 2 groups for brevity
      });
    }
    
    console.log('\n2. Testing createGroup...');
    
    const testGroup = {
      name: `Test Group ${Date.now()}`,
      description: 'Test group created by diagnostic script',
      created_by: null // Test with null first
    };
    
    const { data: newGroup, error: createError } = await supabase
      .from('groups')
      .insert([testGroup])
      .select()
      .single();
    
    if (createError) {
      console.error('Create group error:', {
        message: createError.message,
        details: createError.details,
        hint: createError.hint,
        code: createError.code,
        full: JSON.stringify(createError, null, 2)
      });
    } else {
      console.log('Create group successful:', {
        id: newGroup.id,
        name: newGroup.name
      });
      
      // Clean up: delete the test group
      const { error: deleteError } = await supabase
        .from('groups')
        .delete()
        .eq('id', newGroup.id);
      
      if (deleteError) {
        console.warn('Could not delete test group:', deleteError.message);
      } else {
        console.log('Test group cleaned up successfully');
      }
    }
    
  } catch (error) {
    console.error('Exception in testGroupOperations:', {
      error: error,
      message: error.message,
      stack: error.stack,
      type: typeof error
    });
  }
}

// Run the test
testGroupOperations().then(() => {
  console.log('\nGroup operations test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
