import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Required for static export
export const dynamic = 'force-static';

export async function GET() {
  try {
    const { data: locations, error } = await supabaseServer
      .from('practice_locations')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching practice locations:', error);
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      data: locations || []
    });
  } catch (error) {
    console.error('Error fetching practice locations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch practice locations' 
      },
      { status: 500 }
    );
  }
}
