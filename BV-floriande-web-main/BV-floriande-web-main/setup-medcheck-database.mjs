import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Setting up MedCheck+ Database...');

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

async function setupMedCheckDatabase() {
  try {
    console.log('🔧 Step 1: Setting up essential functions...');
    const functionsSQL = readFileSync('supabase/migrations/01_essential_functions.sql', 'utf8');
    
    // Execute the functions SQL directly using .sql() query
    const { error: functionsError } = await supabase.from('_').select('1').limit(0);
    
    // Try to create functions using raw query
    try {
      console.log('📦 Creating exec_sql and ping functions...');
      
      // Create exec_sql function first
      const { error: execSqlError } = await supabase.rpc('query', {
        query: `
          CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$;
        `
      });
      
      if (execSqlError) {
        console.log('⚠️ exec_sql function creation may have failed, continuing...');
      }
      
      // Create ping function
      const { error: pingError } = await supabase.rpc('query', {
        query: `
          CREATE OR REPLACE FUNCTION public.ping()
          RETURNS jsonb
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            RETURN jsonb_build_object(
              'message', 'pong',
              'timestamp', NOW()::text
            );
          END;
          $$;
        `
      });
      
      if (pingError) {
        console.log('⚠️ ping function creation may have failed, continuing...');
      }
      
    } catch (e) {
      console.log('⚠️ Function creation via RPC failed, will try direct execution...');
    }
    
    console.log('🔧 Step 2: Applying MedCheck+ transformation...');
    const migrationSQL = readFileSync('supabase/migrations/20250619_medcheck_transformation.sql', 'utf8');
    
    // Try using exec_sql if it exists, otherwise split and execute statements
    try {
      const { error: migrationError } = await supabase.rpc('exec_sql', { 
        sql: migrationSQL 
      });
      
      if (migrationError) {
        throw migrationError;
      }
      
      console.log('✅ MedCheck+ transformation completed via exec_sql!');
    } catch (execError) {
      console.log('⚠️ exec_sql not available, trying alternative approach...');
      console.log('📋 Please manually execute the following SQL files in Supabase SQL Editor:');
      console.log('   1. supabase/migrations/01_essential_functions.sql');
      console.log('   2. supabase/migrations/20250619_medcheck_transformation.sql');
      console.log('');
      console.log('🔗 Go to: https://supabase.com/dashboard/project/' + process.env.SUPABASE_PROJECT_ID + '/sql/new');
      return false;
    }
    
    console.log('🎯 MedCheck+ database setup completed!');
    console.log('🏥 Database is now ready for MedCheck+ features:');
    console.log('   • Patient management');
    console.log('   • Appointment booking');
    console.log('   • Doctor/assistant dashboard');
    console.log('   • Email notifications');
    
    return true;
  } catch (error) {
    console.error('❌ Setup error:', error);
    return false;
  }
}

// Execute the setup
setupMedCheckDatabase()
  .then(success => {
    if (success) {
      console.log('🎉 MedCheck+ setup completed successfully!');
      process.exit(0);
    } else {
      console.log('⚠️ Manual setup required - see instructions above');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('💥 Setup failed with error:', error);
    process.exit(1);
  });
