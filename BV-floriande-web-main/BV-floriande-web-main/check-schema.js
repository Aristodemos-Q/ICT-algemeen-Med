/*
 * Check existing database schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  try {
    console.log('🔍 Checking current database schema...');
    
    // Try to query each table to see if it exists
    const tables = [
      'users', 'patients', 'practice_locations', 'appointment_types',
      'appointments', 'appointment_requests', 'medical_records', 
      'prescriptions', 'doctor_schedules'
    ];
    
    const existingTables = [];
    const missingTables = [];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error) {
          existingTables.push(table);
          console.log(`✅ Table '${table}' exists`);
        } else {
          missingTables.push(table);
          console.log(`❌ Table '${table}' missing: ${error.message}`);
        }
      } catch (err) {
        missingTables.push(table);
        console.log(`❌ Table '${table}' missing: ${err.message}`);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log('✅ Existing tables:', existingTables);
    console.log('❌ Missing tables:', missingTables);
    
    if (missingTables.length > 0) {
      console.log('\n💡 You need to run the migration to create missing tables');
      console.log('� Run the SQL migration script in Supabase Dashboard');
    } else {
      console.log('\n🎉 All MedCheck+ tables are present!');
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema();
