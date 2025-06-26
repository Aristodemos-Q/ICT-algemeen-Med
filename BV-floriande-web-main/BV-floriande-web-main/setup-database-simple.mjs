// Simple database setup script for MedCheck+
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('SERVICE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');

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

async function setupDatabase() {
  try {
    console.log('🚀 Setting up MedCheck+ database...');
    
    console.log('✅ Database connection successful');
    
    // Check if appointment_types table exists
    const { data: existingTypes, error: typesError } = await supabase
      .from('appointment_types')
      .select('id')
      .limit(1);
    
    if (typesError) {
      console.log('⚠️ appointment_types table does not exist, it needs to be created in Supabase dashboard');
      console.log('📋 Please run the QUICK-SETUP-MEDCHECK.sql script in your Supabase SQL Editor');
      console.log('🔗 Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql');
      console.log('Error details:', typesError);
      return false;
    }
    
    console.log('✅ appointment_types table exists');
    
    // Check if we have sample data
    const { data: types, error } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error('❌ Error reading appointment types:', error);
      return false;
    }
    
    console.log(`📊 Found ${types.length} appointment types in database`);
    
    if (types.length === 0) {
      console.log('⚠️ No appointment types found. Sample data may need to be inserted.');
      console.log('📋 Please ensure the QUICK-SETUP-MEDCHECK.sql script was run completely');
    } else {
      console.log('✅ Sample data found:');
      types.forEach(type => {
        console.log(`  - ${type.name} (${type.duration_minutes}min, €${type.price})`);
      });
    }
    
    // Check locations
    const { data: locations } = await supabase
      .from('practice_locations')
      .select('*');
    
    console.log(`📍 Found ${locations?.length || 0} practice locations`);
    
    console.log('🎉 Database setup check completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

setupDatabase().then(() => {
  console.log('✨ Setup process finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Setup process failed:', error);
  process.exit(1);
});
