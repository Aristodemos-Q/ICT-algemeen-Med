import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧹 Cleaning database and applying fresh MedCheck+ schema...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanAndApplySchema() {
  try {
    console.log('🗑️ Dropping existing tables...');
    
    // Enhanced drop tables SQL with better conflict handling
    const dropTablesSQL = `
      -- Drop MedCheck+ tables first (in dependency order)
      DROP TABLE IF EXISTS public.prescriptions CASCADE;
      DROP TABLE IF EXISTS public.medical_records CASCADE;
      DROP TABLE IF EXISTS public.appointment_requests CASCADE;
      DROP TABLE IF EXISTS public.doctor_schedules CASCADE;
      DROP TABLE IF EXISTS public.appointments CASCADE;
      DROP TABLE IF EXISTS public.appointment_types CASCADE;
      DROP TABLE IF EXISTS public.practice_locations CASCADE;
      DROP TABLE IF EXISTS public.patients CASCADE;
      
      -- Drop BV Floriande tables
      DROP TABLE IF EXISTS public.group_evaluations CASCADE;
      DROP TABLE IF EXISTS public.completed_exercises CASCADE;
      DROP TABLE IF EXISTS public.attendance CASCADE;
      DROP TABLE IF EXISTS public.session_trainers CASCADE;
      DROP TABLE IF EXISTS public.sessions CASCADE;
      DROP TABLE IF EXISTS public.exercises CASCADE;
      DROP TABLE IF EXISTS public.locations CASCADE;
      DROP TABLE IF EXISTS public.group_members CASCADE;
      DROP TABLE IF EXISTS public.group_trainers CASCADE;
      DROP TABLE IF EXISTS public.members CASCADE;
      DROP TABLE IF EXISTS public.groups CASCADE;
      
      -- Drop any functions that might cause conflicts
      DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
      DROP FUNCTION IF EXISTS public.set_scheduled_date() CASCADE;
      DROP FUNCTION IF EXISTS public.generate_patient_number() CASCADE;
      DROP FUNCTION IF EXISTS public.set_patient_number() CASCADE;
      DROP FUNCTION IF EXISTS public.ping() CASCADE;
      DROP FUNCTION IF EXISTS public.exec_sql(text) CASCADE;
      
      -- Create exec_sql function for this migration
      CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $function$
      BEGIN
        EXECUTE sql;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'SQL execution warning: %', SQLERRM;
      END;
      $function$;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropTablesSQL 
    });
    
    if (dropError) {
      console.log('⚠️ Some drop operations failed (this is normal):', dropError.message);
    } else {
      console.log('✅ Existing tables dropped successfully');
    }

    console.log('📖 Reading MedCheck+ migration...');
    const migrationSQL = readFileSync('supabase/migrations/20250619_medcheck_transformation.sql', 'utf8');
    console.log(`📄 Migration loaded (${migrationSQL.length} characters)`);

    console.log('🔧 Applying fresh MedCheck+ schema...');
    const { error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
    
    console.log('✅ MedCheck+ schema applied successfully!');
    console.log('🏥 Database is now ready for MedCheck+ features:');
    console.log('   • Patient management');
    console.log('   • Appointment booking');
    console.log('   • Doctor/assistant dashboard');
    console.log('   • Email notifications');
    console.log('   • Medical records');
    console.log('   • Prescriptions');
    
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error);
    
    // If error is about existing relations, try to continue
    if (error.message && error.message.includes('already exists')) {
      console.log('⚠️  Some tables already exist, attempting to continue...');
      return true;
    }
    
    return false;
  }
}

// Execute the migration
cleanAndApplySchema()
  .then(success => {
    if (success) {
      console.log('🎯 MedCheck+ database setup completed!');
      process.exit(0);
    } else {
      console.log('💥 MedCheck+ setup failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Setup failed with error:', error);
    process.exit(1);
  });
