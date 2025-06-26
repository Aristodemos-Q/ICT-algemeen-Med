/*
 * Check what users exist in the database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  console.log('Checking users in database...');
  
  try {
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else {
      console.log('\nProfiles:', profiles);
    }
    
    // Check appointment_requests table
    const { data: requests, error: requestsError } = await supabase
      .from('appointment_requests')
      .select('*')
      .limit(5);
    
    if (requestsError) {
      console.error('Error fetching appointment requests:', requestsError);
    } else {
      console.log('\nAppointment requests:', requests);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
