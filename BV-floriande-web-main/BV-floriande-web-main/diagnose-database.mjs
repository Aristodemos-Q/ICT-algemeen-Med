// Test script to diagnose Supabase database issues
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 MedCheck+ Database Diagnostics');
console.log('==================================');
console.log(`🔗 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 API Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'MISSING'}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostics() {
  console.log('\n📊 Running database diagnostics...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('appointment_types').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('❌ Basic connection failed:', error);
    } else {
      console.log(`✅ Basic connection works. Found ${data} records in appointment_types`);
    }

    // Test 2: List all tables
    console.log('\n2️⃣ Checking available tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Cannot list tables:', tablesError);
    } else {
      console.log('✅ Available tables:', tables?.map(t => t.table_name).join(', '));
    }

    // Test 3: Appointment Types
    console.log('\n3️⃣ Testing appointment_types table...');
    const { data: appointmentTypes, error: typesError } = await supabase
      .from('appointment_types')
      .select('*')
      .limit(5);
    
    if (typesError) {
      console.log('❌ Error accessing appointment_types:', typesError);
    } else {
      console.log(`✅ appointment_types: ${appointmentTypes?.length || 0} records found`);
      if (appointmentTypes?.length > 0) {
        console.log('   Sample record:', appointmentTypes[0]);
      }
    }

    // Test 4: Appointment Requests
    console.log('\n4️⃣ Testing appointment_requests table...');
    const { data: requests, error: requestsError } = await supabase
      .from('appointment_requests')
      .select('*')
      .limit(5);
    
    if (requestsError) {
      console.log('❌ Error accessing appointment_requests:', requestsError);
      console.log('   Details:', {
        message: requestsError.message,
        details: requestsError.details,
        hint: requestsError.hint,
        code: requestsError.code
      });
    } else {
      console.log(`✅ appointment_requests: ${requests?.length || 0} records found`);
      if (requests?.length > 0) {
        console.log('   Sample record:', requests[0]);
      }
    }

    // Test 5: Complex query (with joins)
    console.log('\n5️⃣ Testing complex query (appointment_requests with appointment_types)...');
    const { data: complexQuery, error: complexError } = await supabase
      .from('appointment_requests')
      .select(`
        *,
        appointment_type:appointment_types(*)
      `)
      .limit(3);
    
    if (complexError) {
      console.log('❌ Error with complex query:', complexError);
    } else {
      console.log(`✅ Complex query: ${complexQuery?.length || 0} records found`);
      if (complexQuery?.length > 0) {
        console.log('   Sample record with join:', {
          id: complexQuery[0].id,
          patient_name: complexQuery[0].patient_name,
          appointment_type: complexQuery[0].appointment_type
        });
      }
    }

    // Test 6: Auth status
    console.log('\n6️⃣ Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('❌ Auth error:', authError);
    } else {
      console.log('✅ Auth status:', user ? `Logged in as ${user.email}` : 'Anonymous access');
    }

  } catch (error) {
    console.error('❌ Diagnostic script failed:', error);
  }
}

runDiagnostics().then(() => {
  console.log('\n🎯 Diagnostic complete!');
}).catch(error => {
  console.error('💥 Diagnostic script error:', error);
});
