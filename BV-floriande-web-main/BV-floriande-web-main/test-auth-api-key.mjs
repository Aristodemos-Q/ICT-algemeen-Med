import { supabase } from './src/lib/supabaseClient.js';
import dotenv from 'dotenv';

console.log('=== AUTHENTICATION & API KEY TEST ===');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testAuthentication() {
  try {
    console.log('1. Testing current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
    } else if (session) {
      console.log('✅ User is authenticated:', {
        userId: session.user.id,
        email: session.user.email,
        hasAccessToken: !!session.access_token
      });
    } else {
      console.log('❌ No active session found');
    }

    console.log('\n2. Testing groups query (should work if authenticated)...');
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .limit(1);

    if (groupsError) {
      console.error('Groups query error:', {
        message: groupsError.message,
        details: groupsError.details,
        code: groupsError.code,
        hint: groupsError.hint
      });
    } else {
      console.log('✅ Groups query successful:', groupsData);
    }

    console.log('\n3. Testing groups insert (should fail if not authenticated)...');
    const { data: insertData, error: insertError } = await supabase
      .from('groups')
      .insert([{
        name: 'Test Group ' + Date.now(),
        description: 'Test description',
        created_by: session?.user?.id || '00000000-0000-0000-0000-000000000000'
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', {
        message: insertError.message,
        details: insertError.details,
        code: insertError.code,
        hint: insertError.hint
      });
      
      // Check for specific error types
      if (insertError.message?.includes('No API key')) {
        console.error('🔑 API KEY ISSUE: The request is not including the API key');
      }
      if (insertError.message?.includes('permission denied') || insertError.message?.includes('RLS')) {
        console.error('🔒 RLS ISSUE: Row Level Security is blocking the insert');
      }
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up - delete the test record
      await supabase.from('groups').delete().eq('id', insertData.id);
    }

  } catch (error) {
    console.error('Test exception:', error);
  }
}

testAuthentication().then(() => {
  console.log('\n=== TEST COMPLETED ===');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
