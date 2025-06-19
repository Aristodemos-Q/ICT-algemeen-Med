import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

console.log('=== DATABASE SCHEMA CHECK ===');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSchema() {
  try {
    console.log('1. Checking if groups table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'groups');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('Groups table exists:', tables?.length > 0);
    }

    console.log('\n2. Checking groups table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'groups');

    if (columnsError) {
      console.error('Error checking columns:', columnsError);
    } else {
      console.log('Groups table columns:', columns);
    }

    console.log('\n3. Checking RLS status...');
    const { data: rlsInfo, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .eq('tablename', 'groups');

    if (rlsError) {
      console.error('Error checking RLS:', rlsError);
    } else {
      console.log('Groups RLS status:', rlsInfo);
    }

    console.log('\n4. Testing basic select (should work with public access)...');
    const { data: selectData, error: selectError } = await supabase
      .from('groups')
      .select('id, name')
      .limit(1);

    if (selectError) {
      console.error('Select error:', {
        message: selectError.message,
        details: selectError.details,
        code: selectError.code
      });
    } else {
      console.log('Select successful:', selectData);
    }

  } catch (error) {
    console.error('Schema check exception:', error);
  }
}

checkDatabaseSchema().then(() => {
  console.log('\n=== SCHEMA CHECK COMPLETED ===');
  process.exit(0);
}).catch((error) => {
  console.error('Schema check failed:', error);
  process.exit(1);
});
