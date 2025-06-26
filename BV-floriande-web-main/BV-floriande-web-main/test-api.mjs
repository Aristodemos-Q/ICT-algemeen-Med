// Test API endpoint voor appointment requests
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

async function testAppointmentAPI() {
  try {
    console.log('🧪 Testing appointment request API...');
    
    // Get a real appointment type ID from the database
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
    console.log('✅ Using appointment type:', appointmentTypes[0].name, 'ID:', appointmentTypeId);
    
    const testData = {
      patient_name: 'API Test Patiënt',
      patient_email: 'apitest@example.com',
      patient_phone: '06-87654321',
      appointment_type_id: appointmentTypeId,
      preferred_date: '2025-06-28',
      preferred_time: '14:00',
      chief_complaint: 'API test klacht voor functionele test',
      urgency: 'normal'
    };
    
    console.log('📤 Sending request to API...');
    
    const response = await fetch('http://localhost:3001/api/appointment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API test successful!');
      console.log('📋 Response:');
      console.log(`  - Success: ${result.success}`);
      console.log(`  - Message: ${result.message}`);
      console.log(`  - Request ID: ${result.data.id}`);
      console.log(`  - Status: ${result.data.status}`);
      console.log(`  - Automation: ${JSON.stringify(result.data.automation)}`);
    } else {
      console.error('❌ API test failed:');
      console.error(`  - Status: ${response.status}`);
      console.error(`  - Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('💥 API test error:', error);
  }
}

console.log('Starting API test...');
testAppointmentAPI();
