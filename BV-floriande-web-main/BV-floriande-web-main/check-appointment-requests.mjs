// Controleer appointment requests in database
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

async function checkAppointmentRequests() {
  try {
    console.log('📋 Checking appointment requests in database...');
    
    const { data: requests, error } = await supabase
      .from('appointment_requests')
      .select(`
        *,
        appointment_type:appointment_types(name, duration_minutes)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching appointment requests:', error);
      return;
    }
    
    console.log(`✅ Found ${requests.length} appointment requests`);
    
    if (requests.length === 0) {
      console.log('📝 No appointment requests found. The system is ready for new requests.');
    } else {
      console.log('📋 Recent appointment requests:');
      requests.forEach((request, index) => {
        console.log(`\n${index + 1}. ${request.patient_name}`);
        console.log(`   📧 Email: ${request.patient_email}`);
        console.log(`   🏥 Type: ${request.appointment_type?.name}`);
        console.log(`   📅 Date: ${request.preferred_date}`);
        console.log(`   ⏰ Time: ${request.preferred_time || 'Niet gespecificeerd'}`);
        console.log(`   📝 Status: ${request.status}`);
        console.log(`   🚨 Urgency: ${request.urgency}`);
        console.log(`   💬 Complaint: ${request.chief_complaint.substring(0, 50)}...`);
        console.log(`   🕐 Created: ${new Date(request.created_at).toLocaleString('nl-NL')}`);
      });
    }
    
    // Count by status
    const { data: statusCounts, error: countError } = await supabase
      .from('appointment_requests')
      .select('status')
      .order('status');
    
    if (!countError && statusCounts) {
      const statusMap = statusCounts.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Status summary:');
      Object.entries(statusMap).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkAppointmentRequests().then(() => {
  console.log('\n✨ Database check completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Database check failed:', error);
  process.exit(1);
});
