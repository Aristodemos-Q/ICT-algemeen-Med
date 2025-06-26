/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * API Route: Practice Locations
 * Public endpoint for fetching practice locations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for API operations to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(req: NextRequest) {
  try {
    // Get practice locations
    const { data: locations, error: locationsError } = await supabase
      .from('practice_locations')
      .select('*')
      .order('is_main_location', { ascending: false })
      .order('name');

    if (locationsError) {
      console.error('Database error:', locationsError);
      return NextResponse.json(
        { error: 'Failed to fetch practice locations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: locations || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
