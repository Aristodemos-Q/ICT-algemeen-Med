import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Applying MedCheck+ Transformation Schema...');

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

async function applyMedCheckTransformation() {
  try {
    console.log('📖 Reading MedCheck+ migration...');
    const migrationSQL = readFileSync('supabase/migrations/20250619_medcheck_transformation.sql', 'utf8');
    console.log(`📄 Migration loaded (${migrationSQL.length} characters)`);

    console.log('🔧 Applying MedCheck+ transformation...');
    const { error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
    
    console.log('✅ MedCheck+ schema transformation completed successfully!');
    console.log('🏥 Database is now ready for MedCheck+ features:');
    console.log('   • Patient management');
    console.log('   • Appointment booking');
    console.log('   • Doctor/assistant dashboard');
    console.log('   • Email notifications');
    
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
  }
}

// Execute the migration
applyMedCheckTransformation()
  .then(success => {
    if (success) {
      console.log('🎯 MedCheck+ transformation completed!');
      process.exit(0);
    } else {
      console.log('💥 MedCheck+ transformation failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Transformation failed with error:', error);
    process.exit(1);
  });
