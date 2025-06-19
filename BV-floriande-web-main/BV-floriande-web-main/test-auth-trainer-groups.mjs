import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

console.log('Testing authentication flow...');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  try {
    // Test getting current user
    console.log('1. Testing current user session...');
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth error:', error);
    } else if (user) {
      console.log('Current user found:', {
        id: user.id,
        email: user.email,
        idType: typeof user.id,
        idLength: user.id?.length,
        isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.id || '')
      });
      
      // Test the trainer groups query with this user ID
      await testTrainerGroupsWithUserId(user.id);
    } else {
      console.log('No user is currently logged in');
    }
    
  } catch (error) {
    console.error('Exception in testAuth:', error);
  }
}

async function testTrainerGroupsWithUserId(userId) {
  console.log('\n2. Testing trainer groups query with real user ID...');
  
  try {
    const { data, error } = await supabase
      .from('group_trainers')
      .select(`
        groups!group_trainers_group_id_fkey(*)
      `)
      .eq('trainer_id', userId);

    if (error) {
      console.error('Trainer groups query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        userId: userId
      });
    } else {
      console.log('Trainer groups query successful:', {
        dataLength: data?.length || 0,
        data: data
      });
    }
    
  } catch (error) {
    console.error('Exception in testTrainerGroupsWithUserId:', error);
  }
}

// Run the test
testAuth().then(() => {
  console.log('\nAuthentication test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
