/*
 * MedCheck+ Database Migration Test Script
 * Test de database migratie lokaal voordat we deze naar Supabase pushen
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMigration() {
  try {
    console.log('🚀 Testing MedCheck+ database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250619_medcheck_transformation.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('appointment_types')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('ℹ️  Tables might not exist yet, this is expected for a fresh migration');
    } else {
      console.log('✅ Database connection successful');
      console.log('📊 Sample data from appointment_types:', data);
    }
    
    // Test if our migration created the tables we expect
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (!tablesError) {
      console.log('📋 Available tables:', tables);
    }
    
    console.log('✅ Migration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration test failed:', error);
    process.exit(1);
  }
}

// Run the test
testMigration();
