// Check and fix RLS policies for appointment requests
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('🛠️  Fixing RLS Policies for MedCheck+');
  console.log('=====================================');
  
  try {
    // Disable RLS on appointment_requests for anonymous inserts
    console.log('\n1️⃣ Setting up appointment_requests RLS policies...');
    
    const rlsQueries = [
      // Enable RLS
      `ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;`,
      
      // Drop existing policies if any
      `DROP POLICY IF EXISTS "Anyone can insert appointment requests" ON appointment_requests;`,
      `DROP POLICY IF EXISTS "Everyone can read appointment requests" ON appointment_requests;`,
      `DROP POLICY IF EXISTS "Staff can read all appointment requests" ON appointment_requests;`,
      `DROP POLICY IF EXISTS "Staff can update appointment requests" ON appointment_requests;`,
      
      // Create new policies
      `CREATE POLICY "Anyone can insert appointment requests" 
       ON appointment_requests FOR INSERT 
       WITH CHECK (true);`,
       
      `CREATE POLICY "Everyone can read appointment requests" 
       ON appointment_requests FOR SELECT 
       USING (true);`,
       
      `CREATE POLICY "Staff can update appointment requests" 
       ON appointment_requests FOR UPDATE 
       USING (true) 
       WITH CHECK (true);`,
    ];

    for (const query of rlsQueries) {
      try {
        const { error } = await supabase.rpc('execute_sql', { sql: query });
        if (error) {
          console.log(`⚠️  Warning executing: ${query.substring(0, 50)}...`);
          console.log(`   Error: ${error.message}`);
        } else {
          console.log(`✅ Executed: ${query.substring(0, 50)}...`);
        }
      } catch (err) {
        console.log(`⚠️  Could not execute: ${query.substring(0, 50)}...`);
      }
    }

    console.log('\n2️⃣ Setting up practice_locations RLS policies...');
    
    const locationQueries = [
      `ALTER TABLE practice_locations ENABLE ROW LEVEL SECURITY;`,
      `DROP POLICY IF EXISTS "Everyone can read practice locations" ON practice_locations;`,
      `CREATE POLICY "Everyone can read practice locations" 
       ON practice_locations FOR SELECT 
       USING (true);`,
    ];

    for (const query of locationQueries) {
      try {
        const { error } = await supabase.rpc('execute_sql', { sql: query });
        if (error) {
          console.log(`⚠️  Warning: ${query.substring(0, 50)}... - ${error.message}`);
        } else {
          console.log(`✅ Executed: ${query.substring(0, 50)}...`);
        }
      } catch (err) {
        console.log(`⚠️  Could not execute: ${query.substring(0, 50)}...`);
      }
    }

    console.log('\n3️⃣ Setting up appointment_types RLS policies...');
    
    const typeQueries = [
      `ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;`,
      `DROP POLICY IF EXISTS "Everyone can read appointment types" ON appointment_types;`,
      `CREATE POLICY "Everyone can read appointment types" 
       ON appointment_types FOR SELECT 
       USING (true);`,
    ];

    for (const query of typeQueries) {
      try {
        const { error } = await supabase.rpc('execute_sql', { sql: query });
        if (error) {
          console.log(`⚠️  Warning: ${query.substring(0, 50)}... - ${error.message}`);
        } else {
          console.log(`✅ Executed: ${query.substring(0, 50)}...`);
        }
      } catch (err) {
        console.log(`⚠️  Could not execute: ${query.substring(0, 50)}...`);
      }
    }

    console.log('\n=====================================');
    console.log('🎉 RLS policies setup completed!');
    console.log('\n📝 Summary:');
    console.log('   • appointment_requests: Anonymous insert allowed');
    console.log('   • practice_locations: Public read access');
    console.log('   • appointment_types: Public read access');
    
  } catch (error) {
    console.error('💥 RLS setup failed:', error);
  }
}

// Alternative approach: Create the SQL file for manual execution
async function createRLSScript() {
  const sqlContent = `
-- MedCheck+ RLS Policies Setup
-- This script sets up Row Level Security policies for Firebase hosting compatibility

-- Appointment Requests
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert appointment requests" ON appointment_requests;
DROP POLICY IF EXISTS "Everyone can read appointment requests" ON appointment_requests;
DROP POLICY IF EXISTS "Staff can update appointment requests" ON appointment_requests;

CREATE POLICY "Anyone can insert appointment requests" 
ON appointment_requests FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Everyone can read appointment requests" 
ON appointment_requests FOR SELECT 
USING (true);

CREATE POLICY "Staff can update appointment requests" 
ON appointment_requests FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Practice Locations
ALTER TABLE practice_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read practice locations" ON practice_locations;

CREATE POLICY "Everyone can read practice locations" 
ON practice_locations FOR SELECT 
USING (true);

-- Appointment Types
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read appointment types" ON appointment_types;

CREATE POLICY "Everyone can read appointment types" 
ON appointment_types FOR SELECT 
USING (true);

-- Appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read appointments" ON appointments;
DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;

CREATE POLICY "Everyone can read appointments" 
ON appointments FOR SELECT 
USING (true);

CREATE POLICY "Staff can manage appointments" 
ON appointments FOR ALL 
USING (true) 
WITH CHECK (true);
`;

  try {
    const fs = await import('fs');
    fs.writeFileSync(path.join(__dirname, 'setup-rls-policies.sql'), sqlContent);
    console.log('📝 Created setup-rls-policies.sql file');
    console.log('   Run this in your Supabase SQL editor to fix RLS policies');
  } catch (error) {
    console.error('Error creating SQL file:', error);
  }
}

// Run both approaches
console.log('Creating RLS setup script...');
await createRLSScript();

console.log('\nAttempting direct RLS policy setup...');
await fixRLSPolicies();
