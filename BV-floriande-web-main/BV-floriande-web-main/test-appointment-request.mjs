// Test script voor appointment booking API
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

async function testAppointmentRequest() {
  try {
    console.log('🧪 Testing appointment request creation...');
    
    // Get a valid appointment type ID
    const { data: appointmentTypes, error: typesError } = await supabase
      .from('appointment_types')
      .select('id, name')
      .eq('is_active', true)
      .limit(1);
    
    if (typesError || !appointmentTypes || appointmentTypes.length === 0) {
      console.error('❌ No appointment types found:', typesError);
      return;
    }
    
    const appointmentTypeId = appointmentTypes[0].id;
    console.log('✅ Using appointment type:', appointmentTypes[0].name);
    
    // Create test appointment request
    const testRequestData = {
      patient_name: 'Test Patiënt',
      patient_email: 'test@example.com',
      patient_phone: '06-12345678',
      appointment_type_id: appointmentTypeId,
      preferred_date: '2025-06-28', // 2 dagen in de toekomst
      preferred_time: '10:00',
      chief_complaint: 'Test klacht voor functionele test',
      urgency: 'normal'
    };
    
    const { data: appointmentRequest, error: requestError } = await supabase
      .from('appointment_requests')
      .insert([testRequestData])
      .select(`
        *,
        appointment_type:appointment_types(name, duration_minutes)
      `)
      .single();
    
    if (requestError) {
      console.error('❌ Failed to create appointment request:', requestError);
      return;
    }
    
    console.log('✅ Appointment request created successfully!');
    console.log('📋 Request details:');
    console.log(`  - ID: ${appointmentRequest.id}`);
    console.log(`  - Patient: ${appointmentRequest.patient_name}`);
    console.log(`  - Email: ${appointmentRequest.patient_email}`);
    console.log(`  - Type: ${appointmentRequest.appointment_type.name}`);
    console.log(`  - Date: ${appointmentRequest.preferred_date}`);
    console.log(`  - Time: ${appointmentRequest.preferred_time}`);
    console.log(`  - Status: ${appointmentRequest.status}`);
    console.log(`  - Urgency: ${appointmentRequest.urgency}`);
    
    // Test reading the request back
    const { data: readRequest, error: readError } = await supabase
      .from('appointment_requests')
      .select('*')
      .eq('id', appointmentRequest.id)
      .single();
    
    if (readError) {
      console.error('❌ Failed to read appointment request back:', readError);
      return;
    }
    
    console.log('✅ Request successfully read back from database');
    
    // Clean up test data
    const { error: deleteError } = await supabase
      .from('appointment_requests')
      .delete()
      .eq('id', appointmentRequest.id);
    
    if (deleteError) {
      console.warn('⚠️  Failed to clean up test data:', deleteError);
    } else {
      console.log('🧹 Test data cleaned up');
    }
    
    console.log('🎉 Appointment request test completed successfully!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testAppointmentRequest().then(() => {
  console.log('✨ Test process finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test process failed:', error);
  process.exit(1);
});
