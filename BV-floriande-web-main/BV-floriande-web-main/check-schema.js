/*
 * Check existing database schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  try {
    console.log('🔍 Checking current database schema...');
    
    // Check for both BV Floriande and MedCheck+ tables
    const bvFloriandeTables = [
      'users', 'groups', 'members', 'group_members', 'group_trainers',
      'locations', 'exercises', 'sessions', 'session_trainers',
      'attendance', 'completed_exercises'
    ];
    
    const medCheckTables = [
      'users', 'patients', 'practice_locations', 'appointment_types',
      'appointments', 'appointment_requests', 'medical_records', 
      'prescriptions', 'doctor_schedules'
    ];
    
    // Helper function to check table existence
    async function checkTableExists(tableName) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        // If no error or error is about empty result, table exists
        return !error || error.code !== 'PGRST106';
      } catch (err) {
        // If error contains "does not exist", table doesn't exist
        return !err.message?.includes('does not exist');
      }
    }
    
    const existingTables = [];
    const missingTables = [];
    
    // Check BV Floriande tables
    console.log('\n📋 Checking BV Floriande tables:');
    for (const table of bvFloriandeTables) {
      try {
        const exists = await checkTableExists(`bv_${table}`);
        
        if (exists) {
          existingTables.push(`bv_${table}`);
          console.log(`✅ BV Table '${table}' exists`);
        } else {
          missingTables.push(`bv_${table}`);
          console.log(`❌ BV Table '${table}' missing`);
        }
      } catch (err) {
        missingTables.push(`bv_${table}`);
        console.log(`❌ BV Table '${table}' missing: ${err.message}`);
      }
    }
    
    // Check MedCheck+ tables
    console.log('\n🏥 Checking MedCheck+ tables:');
    for (const table of medCheckTables) {
      try {
        const exists = await checkTableExists(`med_${table}`);
        
        if (exists) {
          existingTables.push(`med_${table}`);
          console.log(`✅ Med Table '${table}' exists`);
        } else {
          missingTables.push(`med_${table}`);
          console.log(`❌ Med Table '${table}' missing`);
        }
      } catch (err) {
        missingTables.push(`med_${table}`);
        console.log(`❌ Med Table '${table}' missing: ${err.message}`);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log('✅ Existing tables:', existingTables.length);
    console.log('❌ Missing tables:', missingTables.length);
    
    if (missingTables.length > 0) {
      console.log('\n💡 Next steps:');
      console.log('1. First run create_users_table.sql to create the users table');
      console.log('2. Then run the MedCheck+ transformation script');
      console.log('📝 Run the SQL migration scripts in Supabase Dashboard');
    } else {
      console.log('\n🎉 All required tables are present!');
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
    
    if (error.message?.includes('already exists')) {
      console.log('\n🔧 Quick fix for "already exists" error:');
      console.log('Run this SQL in Supabase dashboard:');
      console.log('DROP TABLE IF EXISTS public.practice_locations CASCADE;');
    }
  }
}

checkSchema();
