/**
 * Simple test script to verify authentication and database fixes
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Testing BV Floriande Authentication and Database Configuration');
console.log('================================================================');

console.log('\n📋 Environment Variables:');
console.log('---------------------------');
console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : '❌ MISSING');
console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : '❌ MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ FAILED: Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database connection error:', error.message);
      if (error.message?.includes('No API key found')) {
        console.error('🔑 API KEY ERROR detected - this should be fixed now!');
      }
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log('🎉 Authentication and database fixes are working!');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
