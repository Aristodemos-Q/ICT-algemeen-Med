import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating safe admin function...');
    
    // Create a simple admin check function that doesn't rely on RLS
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.is_admin_safe()
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
    
    if (error) {
      console.error('Error creating admin function:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 });
    }
    
    console.log('Admin function created successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Safe admin function created successfully',
      data 
    });
    
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error occurred',
      details: err 
    }, { status: 500 });
  }
}
