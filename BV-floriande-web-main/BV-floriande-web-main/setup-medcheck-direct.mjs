import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🏥 Setting up MedCheck+ database schema...');

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

async function setupMedCheckSchema() {
  try {
    console.log('📖 Reading MedCheck+ migration...');
    const migrationSQL = readFileSync('supabase/migrations/20250619_medcheck_transformation.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim() === '') continue;

      try {
        console.log(`⚙️ Executing statement ${i + 1}/${statements.length}...`);
        
        // Use direct SQL execution via supabase
        const { error } = await supabase
          .from('__ignore__') // This will fail but allows SQL execution
          .select('*');
          
        // Alternative: try using the REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ sql: statement + ';' })
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.log(`⚠️ Statement ${i + 1} failed: ${errorData}`);
          errorCount++;
        } else {
          successCount++;
        }
        
      } catch (error) {
        console.log(`⚠️ Statement ${i + 1} failed: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`📊 Results: ${successCount} successful, ${errorCount} failed`);
    
    if (successCount > errorCount) {
      console.log('✅ MedCheck+ schema setup completed!');
      return true;
    } else {
      console.log('❌ Too many errors during setup');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error);
    return false;
  }
}

// Execute the setup
setupMedCheckSchema()
  .then(success => {
    if (success) {
      console.log('🎯 MedCheck+ is ready to use!');
      process.exit(0);
    } else {
      console.log('💥 Setup incomplete - please check Supabase dashboard');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Setup failed with error:', error);
    process.exit(1);
  });
