/*
 * Check exact column structure of appointment_requests table
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructure() {
  console.log('Checking appointment_requests table structure...');
  
  try {
    // Get a sample record to see available columns
    const { data, error } = await supabase
      .from('appointment_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error:', error);
    } else if (data && data.length > 0) {
      console.log('Available columns:', Object.keys(data[0]));
      console.log('Sample record:', data[0]);
    } else {
      console.log('No records found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTableStructure();
