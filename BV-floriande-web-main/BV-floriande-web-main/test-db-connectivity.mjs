import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing database connectivity...');

async function testConnection() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basis verbinding
    console.log('📡 Testing basic connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth test failed:', authError.message);
    } else {
      console.log('✅ Auth connection works');
    }

    // Test database access
    console.log('🗄️ Testing database access...');
    
    // Test ping functie
    try {
      const { data: pingData, error: pingError } = await supabase.rpc('ping');
      if (pingError) {
        console.log('⚠️  Ping function not available:', pingError.message);
      } else {
        console.log('✅ Ping function works:', pingData);
      }
    } catch (e) {
      console.log('⚠️  Ping function test failed:', e.message);
    }

    // Test exec_sql functie
    try {
      const { data: execData, error: execError } = await supabase.rpc('exec_sql', {
        sql: 'SELECT 1 as test'
      });
      if (execError) {
        console.log('⚠️  exec_sql function not available:', execError.message);
      } else {
        console.log('✅ exec_sql function works:', execData);
      }
    } catch (e) {
      console.log('⚠️  exec_sql function test failed:', e.message);
    }

    // Test tabellen
    console.log('📊 Testing existing tables...');
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10);
    
    if (tablesError) {
      console.log('❌ Cannot access table information:', tablesError.message);
    } else {
      console.log('✅ Found tables:', tablesData?.map(t => t.table_name) || []);
    }

    return true;
  } catch (error) {
    console.error('💥 Connection test failed:', error.message);
    return false;
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('🎯 Database connectivity test completed');
    } else {
      console.log('❌ Database connectivity test failed');
    }
  });
