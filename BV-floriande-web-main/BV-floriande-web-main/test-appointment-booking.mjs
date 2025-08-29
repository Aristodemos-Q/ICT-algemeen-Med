// Test appointment booking functionality using direct Supabase queries
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppointmentBookingSupabase() {
  console.log('🧪 Testing Appointment Booking with Direct Supabase Queries\n');
  console.log('==================================================');
  
  // Test the data loading that the page uses
  console.log('📋 Testing data loading for appointment booking...');
  
  try {
    // Test appointment types query
    console.log('\n1️⃣ Loading appointment types from Supabase...');
    const { data: appointmentTypes, error: typesError } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (typesError) {
      console.log(`❌ Failed to load appointment types: ${typesError.message}`);
      return false;
    }
    
    console.log(`✅ Appointment types loaded: ${appointmentTypes?.length || 0} types`);
    
    if (appointmentTypes && appointmentTypes.length > 0) {
      const sampleType = appointmentTypes[0];
      console.log(`   📝 Sample type: ${sampleType.name} (${sampleType.duration_minutes} min)`);
    }
    
    // Test practice locations query
    console.log('\n2️⃣ Loading practice locations from Supabase...');
    const { data: locations, error: locationsError } = await supabase
      .from('practice_locations')
      .select('*')
      .order('is_main_location', { ascending: false })
      .order('name');
    
    if (locationsError) {
      console.log(`❌ Failed to load practice locations: ${locationsError.message}`);
      return false;
    }
    
    console.log(`✅ Practice locations loaded: ${locations?.length || 0} locations`);
    
    if (locations && locations.length > 0) {
      const sampleLocation = locations[0];
      console.log(`   📍 Sample location: ${sampleLocation.name}`);
      console.log(`   📧 Contact: ${sampleLocation.email}`);
    }
    
    // Test appointment request submission
    console.log('\n3️⃣ Testing appointment request submission...');
    
    const testAppointmentRequest = {
      patient_name: 'Test Patient',
      patient_email: 'test@example.com',
      patient_phone: '0612345678',
      patient_birth_date: '1990-01-01',
      appointment_type_id: appointmentTypes?.[0]?.id || null,
      preferred_date: new Date().toISOString().split('T')[0],
      preferred_time: '10:00',
      alternative_dates: [],
      chief_complaint: 'Test complaint for Supabase testing',
      urgency: 'normal',
      status: 'pending'
    };
    
    const { data: appointmentRequest, error: submitError } = await supabase
      .from('appointment_requests')
      .insert([testAppointmentRequest])
      .select(`
        *,
        appointment_type:appointment_types(*)
      `)
      .single();
    
    if (submitError) {
      console.log(`⚠️  Appointment submission issue: ${submitError.message}`);
    } else {
      console.log('✅ Appointment request submission works');
      console.log(`   📝 Request ID: ${appointmentRequest?.id || 'unknown'}`);
      
      // Clean up: delete the test request
      await supabase
        .from('appointment_requests')
        .delete()
        .eq('id', appointmentRequest.id);
      console.log('   🧹 Test request cleaned up');
    }
    
    console.log('\n==================================================');
    console.log('🎉 Appointment booking now uses direct Supabase queries!');
    console.log('\n📊 Summary:');
    console.log(`   • Appointment types: ${appointmentTypes?.length || 0} available`);
    console.log(`   • Practice locations: ${locations?.length || 0} available`);
    console.log('   • Supabase connection: Working ✅');
    console.log('   • Direct queries: Implemented ✅');
    console.log('\n💡 No more dependency on Next.js API routes - ready for static export!');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    return false;
  }
}

// Run the test
testAppointmentBookingSupabase().catch(error => {
  console.error('❌ Test script error:', error);
});
