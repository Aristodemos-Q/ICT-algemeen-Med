import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Required for static export
export const dynamic = 'force-static';

export async function GET() {
  try {
    const { data: requests, error } = await supabaseServer
      .from('appointment_requests')
      .select(`
        *,
        appointment_type:appointment_types(*),
        processed_by_user:users(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching appointment requests:', error);
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      data: requests || []
    });
  } catch (error) {
    console.error('Error fetching appointment requests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch appointment requests' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data: appointmentRequest, error } = await supabaseServer
      .from('appointment_requests')
      .insert([{
        patient_name: body.patient_name,
        patient_email: body.patient_email,
        patient_phone: body.patient_phone,
        patient_birth_date: body.patient_birth_date,
        appointment_type_id: body.appointment_type_id,
        preferred_date: body.preferred_date,
        preferred_time: body.preferred_time,
        alternative_dates: body.alternative_dates,
        chief_complaint: body.chief_complaint,
        urgency: body.urgency,
        status: 'pending'
      }])
      .select(`
        *,
        appointment_type:appointment_types(*)
      `)
      .single();
    
    if (error) {
      console.error('Error creating appointment request:', error);
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Appointment request created successfully',
      data: appointmentRequest
    });
  } catch (error) {
    console.error('Error creating appointment request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create appointment request' 
      },
      { status: 500 }
    );
  }
}
