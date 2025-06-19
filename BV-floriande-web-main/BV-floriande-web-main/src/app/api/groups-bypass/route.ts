import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This is a temporary workaround to get groups data without RLS issues
export async function GET(request: NextRequest) {
  try {
    console.log('Attempting to fetch groups with bypass...');
    
    // Create a client with the anon key but try to query without user context
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Try to get groups by explicitly querying without user-specific filters
    console.log('Fetching all groups...');
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .limit(1000); // Add a reasonable limit
    
    if (error) {
      console.error('Error fetching groups:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Check if this is the infinite recursion error
      if (error.code === '42P17') {
        return NextResponse.json({
          success: false,
          error: 'Infinite recursion in database policies detected',
          details: error,
          suggestion: 'The Row Level Security policies need to be fixed to prevent infinite recursion between users and groups tables.'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }
    
    console.log(`Successfully fetched ${data?.length || 0} groups`);
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
    
  } catch (err: any) {
    console.error('Unexpected error in groups bypass:', err);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error occurred',
      details: err.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'POST method not supported for this endpoint'
  }, { status: 405 });
}
