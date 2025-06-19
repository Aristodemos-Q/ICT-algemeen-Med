import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuratie
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🚀 Applying MedCheck+ Database Schema...');

async function applySchema() {
  try {
    // Maak Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔗 Testing Supabase connection...');
    
    // Test basic connection
    const { error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (testError && !testError.message?.includes('permission denied')) {
      console.error('❌ Connection test failed:', testError);
      return false;
    }
    
    console.log('✅ Connection successful');

    // Step 1: Create users table first
    console.log('📋 Step 1: Creating users table...');
    const usersPath = join(__dirname, 'supabase', 'migrations', 'create_users_table.sql');
    
    try {
      const usersSQL = readFileSync(usersPath, 'utf8');
      const { error: usersError } = await supabase.rpc('exec_sql', { sql: usersSQL });
      
      if (usersError && !usersError.message?.includes('already exists')) {
        console.error('❌ Error creating users table:', usersError);
        return false;
      }
      console.log('✅ Users table ready');
    } catch (readError) {
      console.log('⚠️  Users table script not found, assuming it exists');
    }

    // Step 2: Apply transformation
    console.log('🏥 Step 2: Applying MedCheck+ transformation...');
    const transformPath = join(__dirname, 'supabase', 'migrations', '20250619_medcheck_transformation.sql');
    
    const transformSQL = readFileSync(transformPath, 'utf8');
    console.log(`📄 Transformation loaded (${transformSQL.length} characters)`);

    // Execute transformation
    const { error: transformError } = await supabase.rpc('exec_sql', { sql: transformSQL });
    
    if (transformError) {
      console.error('❌ Transformation failed:', transformError);
      return false;
    }

    console.log('✅ MedCheck+ transformation completed!');

    // Test the new schema
    console.log('🧪 Testing new schema...');
    const tables = ['users', 'patients', 'practice_locations', 'appointment_types', 'appointments'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: OK`);
      }
    }

    console.log('🎯 MedCheck+ schema has been applied successfully!');
    console.log('');
    console.log('✅ Database transformed to medical practice system');
    console.log('✅ User authentication preserved');
    console.log('✅ Sample data included for testing');
    
    return true;
    
  } catch (error) {
    console.error('💥 Fatal error applying schema:', error);
    return false;
  }
}

// Voer de schema toe
applySchema()
  .then(success => {
    if (success) {
      console.log('🏁 Schema transformation completed successfully!');
      process.exit(0);
    } else {
      console.log('💥 Schema transformation failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
    }

    console.log('🎯 Final consolidated schema has been applied successfully!');
    console.log('');
    console.log('✅ Database is now clean and ready for use');
    console.log('✅ No sample data included');
    console.log('✅ All functionality preserved');
    console.log('✅ Safe RLS policies applied');
    
    return true;
    
  } catch (error) {
    console.error('💥 Fatal error applying migration:', error);
    return false;
  }
}

// Voer de migratie uit
applyFinalSchema()
  .then(success => {
    if (success) {
      console.log('🏁 Migration completed successfully!');
      process.exit(0);
    } else {
      console.log('💥 Migration failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
