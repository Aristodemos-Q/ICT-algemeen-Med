// Debug Supabase client configuration
import { supabase } from './src/lib/supabaseClient.js';

console.log('=== SUPABASE CLIENT DEBUG ===');

// Check environment variables
console.log('Environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');

// Check if client is available
console.log('Supabase client:', supabase ? 'AVAILABLE' : 'MISSING');

// Test basic functionality
if (supabase) {
  console.log('Testing basic query...');
  
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Query error:', {
        message: error.message,
        details: error.details,
        code: error.code
      });
    } else {
      console.log('Query successful, data:', data);
    }
  } catch (err) {
    console.error('Query exception:', err);
  }
} else {
  console.error('Cannot test - Supabase client not available');
}

console.log('=== END DEBUG ===');
