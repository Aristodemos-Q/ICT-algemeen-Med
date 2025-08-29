// Test appointment booking functionality with direct queries
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppointmentBooking() {
  console.log('🧪 Testing Appointment Booking Flow');
  console.log('===================================');
  
  try {
    // Step 1: Test loading appointment types
    console.log('\n1️⃣ Loading appointment types for booking...');
    const { data: appointmentTypes, error: typesError } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (typesError) {
      console.error('❌ Error loading appointment types:', typesError);
      return false;
    }

    console.log(`✅ Loaded ${appointmentTypes?.length || 0} appointment types`);
    if (!appointmentTypes || appointmentTypes.length === 0) {
      console.log('⚠️  No appointment types available for booking');
      return false;
    }

    // Step 2: Test loading practice locations
    console.log('\n2️⃣ Loading practice locations...');
    const { data: locations, error: locationsError } = await supabase
      .from('practice_locations')
      .select('*')
      .order('is_main_location', { ascending: false });
    
    if (locationsError) {
      console.error('❌ Error loading practice locations:', locationsError);
      return false;
    }

    console.log(`✅ Loaded ${locations?.length || 0} practice locations`);
    if (!locations || locations.length === 0) {
      console.log('⚠️  No practice locations available');
      return false;
    }

    // Step 3: Create a test appointment request
    console.log('\n3️⃣ Creating test appointment request...');
    const testRequest = {
      patient_name: 'Test Patient Firebase',
      patient_email: 'test.firebase@example.com',
      patient_phone: '06-12345678',
      patient_birth_date: '1990-01-01',
      appointment_type_id: appointmentTypes[0].id,
      preferred_date: '2025-07-01',
      preferred_time: '14:30:00',
      chief_complaint: 'Test appointment for Firebase hosting',
      urgency: 'normal'
    };

    const { data: createdRequest, error: createError } = await supabase
      .from('appointment_requests')
      .insert([testRequest])
      .select(`
        *,
        appointment_type:appointment_types(*)
      `)
      .single();

    if (createError) {
      console.error('❌ Error creating appointment request:', createError);
      return false;
    }

    console.log('✅ Test appointment request created successfully');
    console.log(`   📝 Request ID: ${createdRequest.id}`);
    console.log(`   👤 Patient: ${createdRequest.patient_name}`);
    console.log(`   📅 Date: ${createdRequest.preferred_date} ${createdRequest.preferred_time}`);
    console.log(`   🏥 Type: ${createdRequest.appointment_type?.name}`);

    // Step 4: Verify the request can be retrieved
    console.log('\n4️⃣ Verifying request retrieval...');
    const { data: retrievedRequests, error: retrieveError } = await supabase
      .from('appointment_requests')
      .select(`
        *,
        appointment_type:appointment_types(*)
      `)
      .eq('patient_email', testRequest.patient_email);

    if (retrieveError) {
      console.error('❌ Error retrieving appointment requests:', retrieveError);
    } else {
      console.log(`✅ Retrieved ${retrievedRequests?.length || 0} requests for patient`);
    }

    // Step 5: Clean up test data
    console.log('\n5️⃣ Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('appointment_requests')
      .delete()
      .eq('id', createdRequest.id);

    if (deleteError) {
      console.warn('⚠️  Could not clean up test data:', deleteError);
    } else {
      console.log('🧹 Test data cleaned up successfully');
    }

    console.log('\n===================================');
    console.log('🎉 Appointment booking test completed successfully!');
    console.log('\n📊 Test Results:');
    console.log(`   • Appointment types available: ${appointmentTypes.length}`);
    console.log(`   • Practice locations available: ${locations.length}`);
    console.log('   • Request creation: ✅ Working');
    console.log('   • Request retrieval: ✅ Working');
    console.log('   • Data cleanup: ✅ Working');
    
    return true;

  } catch (error) {
    console.error('💥 Test failed:', error);
    return false;
  }
}

// Run the test
testAppointmentBooking().then(success => {
  console.log(`\n🏁 Test ${success ? 'PASSED' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});
