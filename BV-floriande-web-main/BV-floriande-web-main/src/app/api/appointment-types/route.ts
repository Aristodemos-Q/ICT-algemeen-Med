import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Required for static export
export const dynamic = 'force-static';

export async function GET() {
  try {
    const { data: appointmentTypes, error } = await supabaseServer
      .from('appointment_types')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching appointment types:', error);
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      data: appointmentTypes || []
    });
  } catch (error) {
    console.error('Error fetching appointment types:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch appointment types' 
      },
      { status: 500 }
    );
  }
}
