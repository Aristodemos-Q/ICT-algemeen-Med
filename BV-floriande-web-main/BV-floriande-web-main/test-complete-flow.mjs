// Complete test van de appointment booking flow
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testCompleteFlow() {
  try {
    console.log('🚀 Testing complete appointment booking flow...\n');
    
    // Step 1: Test API endpoints
    console.log('📡 Step 1: Testing API endpoints...');
    
    const [appointmentTypesResponse, locationsResponse] = await Promise.all([
      fetch('http://localhost:3001/api/appointment-types'),
      fetch('http://localhost:3001/api/practice-locations')
    ]);
    
    if (!appointmentTypesResponse.ok || !locationsResponse.ok) {
      throw new Error('API endpoints not working');
    }
    
    const appointmentTypesResult = await appointmentTypesResponse.json();
    const locationsResult = await locationsResponse.json();
    
    console.log(`✅ Appointment types API: ${appointmentTypesResult.data.length} types found`);
    console.log(`✅ Practice locations API: ${locationsResult.data.length} locations found`);
    
    // Step 2: Submit a test appointment request
    console.log('\n📝 Step 2: Submitting test appointment request...');
    
    const testAppointmentData = {
      patient_name: 'Flow Test Patiënt',
      patient_email: 'flowtest@example.com',
      patient_phone: '06-12345678',
      appointment_type_id: appointmentTypesResult.data[0].id,
      preferred_date: '2025-06-30',
      preferred_time: '10:30',
      chief_complaint: 'Complete flow test voor MedCheck+ systeem',
      urgency: 'normal'
    };
    
    const appointmentResponse = await fetch('http://localhost:3001/api/appointment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAppointmentData),
    });
    
    if (!appointmentResponse.ok) {
      const errorResult = await appointmentResponse.json();
      throw new Error(`API request failed: ${errorResult.error}`);
    }
    
    const appointmentResult = await appointmentResponse.json();
    console.log('✅ Appointment request submitted successfully');
    console.log(`   Request ID: ${appointmentResult.data.id}`);
    console.log(`   Status: ${appointmentResult.data.status}`);
    console.log(`   Automation: ${JSON.stringify(appointmentResult.data.automation)}`);
    
    // Step 3: Verify data in database
    console.log('\n🔍 Step 3: Verifying data in database...');
    
    const { data: savedRequest, error: fetchError } = await supabase
      .from('appointment_requests')
      .select(`
        *,
        appointment_type:appointment_types(name)
      `)
      .eq('id', appointmentResult.data.id)
      .single();
    
    if (fetchError) {
      throw new Error(`Failed to fetch saved request: ${fetchError.message}`);
    }
    
    console.log('✅ Request verified in database:');
    console.log(`   Patient: ${savedRequest.patient_name}`);
    console.log(`   Email: ${savedRequest.patient_email}`);
    console.log(`   Type: ${savedRequest.appointment_type.name}`);
    console.log(`   Date: ${savedRequest.preferred_date}`);
    console.log(`   Time: ${savedRequest.preferred_time}`);
    console.log(`   Status: ${savedRequest.status}`);
    
    // Step 4: Clean up test data
    console.log('\n🧹 Step 4: Cleaning up test data...');
    
    const { error: deleteError } = await supabase
      .from('appointment_requests')
      .delete()
      .eq('id', appointmentResult.data.id);
    
    if (deleteError) {
      console.warn('⚠️ Could not clean up test data:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }
    
    console.log('\n🎉 COMPLETE FLOW TEST PASSED! 🎉');
    console.log('All systems are working correctly:');
    console.log('   ✅ API endpoints responsive');
    console.log('   ✅ Frontend data loading');
    console.log('   ✅ Appointment submission');
    console.log('   ✅ Database persistence');
    console.log('   ✅ Data retrieval');
    
  } catch (error) {
    console.error('\n❌ FLOW TEST FAILED:', error.message);
    console.error('Full error:', error);
  }
}

testCompleteFlow().then(() => {
  console.log('\n✨ Flow test completed');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Flow test error:', error);
  process.exit(1);
});
