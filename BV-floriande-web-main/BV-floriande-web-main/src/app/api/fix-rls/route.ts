import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('Applying RLS policy fix...');
    
    // Step 1: Disable RLS temporarily
    console.log('Step 1: Disabling RLS temporarily...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
      `
    });

    // Step 2: Drop problematic policies
    console.log('Step 2: Dropping problematic policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Admins can manage user profiles" ON public.users;
        DROP POLICY IF EXISTS "Admins or group creators can manage groups" ON public.groups;
        DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.users;
        DROP POLICY IF EXISTS "Users can update their own name" ON public.users;
      `
    });

    // Step 3: Create admin check function
    console.log('Step 3: Creating admin check function...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.is_admin()
        RETURNS boolean
        LANGUAGE sql
        SECURITY DEFINER
        STABLE
        AS $$
          SELECT EXISTS (
            SELECT 1 
            FROM auth.users au
            WHERE au.id = auth.uid() 
            AND (au.raw_user_meta_data->>'role')::text = 'admin'
          );
        $$;
      `
    });

    // Step 4: Create safe policies
    console.log('Step 4: Creating safe policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can view their own profile"
          ON public.users FOR SELECT
          USING (auth.uid() = id);

        CREATE POLICY "Users can update their own profile"
          ON public.users FOR UPDATE
          USING (auth.uid() = id)
          WITH CHECK (auth.uid() = id);

        CREATE POLICY "Admins can manage all profiles"
          ON public.users FOR ALL
          USING (public.is_admin())
          WITH CHECK (public.is_admin());

        CREATE POLICY "Anyone can view groups"
          ON public.groups FOR SELECT
          USING (true);

        CREATE POLICY "Creators and admins can manage groups"
          ON public.groups FOR ALL
          USING (
            created_by = auth.uid() OR public.is_admin()
          )
          WITH CHECK (
            created_by = auth.uid() OR public.is_admin()
          );
      `
    });

    // Step 5: Re-enable RLS
    console.log('Step 5: Re-enabling RLS...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
      `
    });

    // Step 6: Grant permissions
    console.log('Step 6: Granting permissions...');
    await supabase.rpc('exec_sql', {
      sql: `
        GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
        GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
        GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
      `
    });

    console.log('RLS policy fix completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'RLS policy fix applied successfully'
    });
  } catch (error: any) {
    console.error('Error applying RLS fix:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error 
    }, { status: 500 });
  }
}
