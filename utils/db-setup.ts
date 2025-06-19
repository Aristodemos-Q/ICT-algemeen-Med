/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { supabase } from '@/lib/supabaseClient';

/**
 * Deze functie controleert of de essentiële tabellen bestaan en maakt ze aan indien nodig
 */
export async function ensureDatabaseSetup(): Promise<boolean> {
  try {
    console.log('Checking database setup...');
    
    // First, ensure the exec_sql function exists
    const execSqlExists = await ensureExecSqlFunction();
    if (!execSqlExists) {
      // We cannot proceed without the exec_sql function
      return false;
    }
    
    // Check if the users table exists by running a simple query
    const { error: queryError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
    
    // If there's no error, the table exists
    if (!queryError) {
      console.log('Database tables already exist');
      return true;
    }
    
    console.log('Users table may not exist, creating basic schema...');
    
    // Create the users table with minimal required schema
    // Using separate SQL statements with proper error handling
    // Creating only the essential tables needed for login functionality
    
    // 1. Create users table
    const { error: createUsersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          role TEXT NOT NULL CHECK (role IN ('admin', 'trainer')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `
    });
    
    if (createUsersError) {
      console.error('Failed to create users table:', createUsersError);
      return false;
    }
    
    // 2. Enable RLS on users table
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`
    });
    
    if (rlsError) {
      console.error('Failed to enable RLS on users table:', rlsError);
      // Continue anyway as this is not critical for basic functionality
    }
    
    // 3. Create basic RLS policies with proper DROP IF EXISTS for safer setup
    try {
      // First, drop existing policies if they exist to prevent conflicts
      await supabase.rpc('exec_sql', {
        sql: `
          DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
          DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
          DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
          DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.users;
        `
      });
      
      // Now create the policies with proper checks for existing users
      const { error: policiesError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Create safer select policies
          CREATE POLICY "Users can view their own profile" 
            ON public.users
            FOR SELECT 
            USING (auth.uid() = id);
            
          CREATE POLICY "Admins can view all profiles" 
            ON public.users
            FOR SELECT 
            USING (
              EXISTS (
                SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
              )
            );
            
          -- More restrictive update policy to prevent role changes
          CREATE POLICY "Users can update their own profile"
            ON public.users
            FOR UPDATE
            USING (auth.uid() = id)
            WITH CHECK (
              auth.uid() = id AND
              role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid())
            );
            
          -- Admin management policy
          CREATE POLICY "Admins can manage all profiles"
            ON public.users
            FOR ALL
            USING (
              EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
            )
            WITH CHECK (
              EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
            );
        `
      });
      
      if (policiesError) {
        console.error('Failed to create RLS policies:', policiesError);
        // Log the detailed error for debugging
        console.error('RLS policy error details:', JSON.stringify(policiesError));
        // Continue anyway as this is not critical for basic login functionality
      } else {
        console.log('RLS policies created successfully');
      }
    } catch (policyError) {
      console.error('Error creating policies:', policyError);
      // Continue despite policy errors
    }
    
    console.log('Basic database schema created successfully');
    return true;
  } catch (err) {    
    console.error('Error ensuring database setup:', err);
    return false;
  }
}

/**
 * Deze functie controleert of de exec_sql functie beschikbaar is in de database
 * en geeft instructies over hoe deze geïnstalleerd kan worden indien nodig
 */
export async function ensureExecSqlFunction(): Promise<boolean> {  
  try {
    console.log('Checking if exec_sql function exists...');
    
    // Test if the exec_sql function exists by calling it with a harmless query
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'SELECT 1'
    });
    
    // If there's no error, the function exists and works
    if (!error) {
      console.log('exec_sql function is available');
      return true;
    }
    
    // Check specifically for permission error
    if (error.message && error.message.includes('Permission denied')) {
      console.error('exec_sql function permission error:', error.message);
      console.error('========================================================================================');
      console.error('IMPORTANT: You do not have permission to use the exec_sql function.');
      console.error('This function requires administrator privileges or needs permission fixes.');
      console.error('');
      console.error('To fix this issue:');
      console.error('');
      console.error('1. LOCAL ENVIRONMENT:');
      console.error('   - Run the apply-migration.bat file to apply the exec_sql permission fix');
      console.error('');
      console.error('2. REMOTE/PRODUCTION ENVIRONMENT:');
      console.error('   - Follow the instructions in apply-remote-migration.bat');
      console.error('   - Go to the Supabase SQL Editor and run the migration file:');
      console.error('     supabase/migrations/20250522_fix_exec_sql_permissions.sql');
      console.error('');
      console.error('3. After applying the migration, restart your application.');
      console.error('========================================================================================');
      
      return false;
    }
    
    // If the function doesn't exist, we need to create it
    console.error('exec_sql function not available. Error:', error.message);
    console.error('========================================================================================');
    console.error('IMPORTANT: The exec_sql function is not available in the database.');
    console.error('This function is required for the database setup operations.');
    console.error('');
    console.error('To fix this issue:');
    console.error('');
    console.error('1. LOCAL ENVIRONMENT:');
    console.error('   - Run the apply-migration.bat file to apply all migrations including exec_sql');
    console.error('');
    console.error('2. REMOTE/PRODUCTION ENVIRONMENT:');
    console.error('   - Follow the instructions in apply-remote-migration.bat');
    console.error('   - Go to the Supabase SQL Editor and run the migration file:');
    console.error('     supabase/migrations/20250521_add_exec_sql_function.sql');
    console.error('');
    console.error('3. After applying the migration, restart your application.');
    console.error('========================================================================================');
    
    return false;
  } catch (err) {
    console.error('Error checking exec_sql function:', err);
    return false;
  }
}
