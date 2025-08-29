// Test direct Supabase queries functionality
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
try {
  const envLocal = readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  const envVars = envLocal.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      acc[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
    return acc;
  }, {});
  
  Object.assign(process.env, envVars);
} catch (error) {
  console.warn('Could not load .env.local file');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectQueries() {
  console.log('🧪 Testing Direct Supabase Queries');
  console.log('==================================');
  
  try {
    // Test appointment types
    console.log('\n1️⃣ Loading appointment types...');
    const { data: appointmentTypes, error: typesError } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (typesError) {
      console.error('❌ Error loading appointment types:', typesError);
    } else {
      console.log(`✅ Loaded ${appointmentTypes?.length || 0} appointment types`);
      if (appointmentTypes && appointmentTypes.length > 0) {
        console.log(`   📝 Sample: ${appointmentTypes[0].name} (${appointmentTypes[0].duration_minutes} min)`);
      }
    }

    // Test practice locations
    console.log('\n2️⃣ Loading practice locations...');
    const { data: locations, error: locationsError } = await supabase
      .from('practice_locations')
      .select('*')
      .order('name');
    
    if (locationsError) {
      console.error('❌ Error loading practice locations:', locationsError);
    } else {
      console.log(`✅ Loaded ${locations?.length || 0} practice locations`);
      if (locations && locations.length > 0) {
        console.log(`   📍 Sample: ${locations[0].name}`);
      }
    }

    // Test appointment requests
    console.log('\n3️⃣ Loading appointment requests...');
    const { data: requests, error: requestsError } = await supabase
      .from('appointment_requests')
      .select(`
        *,
        appointment_type:appointment_types(*)
      `)
      .limit(5);
    
    if (requestsError) {
      console.error('❌ Error loading appointment requests:', requestsError);
    } else {
      console.log(`✅ Loaded ${requests?.length || 0} appointment requests`);
      if (requests && requests.length > 0) {
        console.log(`   📋 Sample: ${requests[0].patient_name} - ${requests[0].status}`);
      }
    }

    // Test appointments
    console.log('\n4️⃣ Loading appointments...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:users!appointments_doctor_id_fkey(*),
        appointment_type:appointment_types(*),
        location:practice_locations(*)
      `)
      .limit(5);
    
    if (appointmentsError) {
      console.error('❌ Error loading appointments:', appointmentsError);
    } else {
      console.log(`✅ Loaded ${appointments?.length || 0} appointments`);
      if (appointments && appointments.length > 0) {
        console.log(`   📅 Sample: ${appointments[0].scheduled_at} - ${appointments[0].status}`);
      }
    }

    console.log('\n==================================');
    console.log('🎉 Direct queries test completed!');
    console.log('\n📊 Summary:');
    console.log(`   • Appointment types: ${appointmentTypes?.length || 0}`);
    console.log(`   • Practice locations: ${locations?.length || 0}`);
    console.log(`   • Appointment requests: ${requests?.length || 0}`);
    console.log(`   • Appointments: ${appointments?.length || 0}`);
    
    if ((appointmentTypes?.length || 0) > 0 && (locations?.length || 0) > 0) {
      console.log('\n✅ Database connectivity: Working');
      console.log('✅ Essential data: Available');
      console.log('✅ Direct queries: Functional');
    } else {
      console.log('\n⚠️  Some essential data may be missing');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testDirectQueries().catch(error => {
  console.error('❌ Test script error:', error);
});
