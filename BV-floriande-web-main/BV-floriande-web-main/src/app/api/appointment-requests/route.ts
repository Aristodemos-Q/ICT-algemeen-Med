/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * API Route: Appointment Requests
 * Public endpoint for patients to submit appointment requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { AppointmentBookingForm } from '@/lib/medcheck-types';

export async function POST(req: NextRequest) {
  try {
    const body: AppointmentBookingForm = await req.json();

    // Validate required fields
    if (!body.patient_name || !body.patient_email || !body.appointment_type_id || !body.preferred_date || !body.chief_complaint || !body.urgency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(body.patient_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate appointment type exists
    const { data: appointmentType, error: typeError } = await supabase
      .from('appointment_types')
      .select('id')
      .eq('id', body.appointment_type_id)
      .eq('is_active', true)
      .single();

    if (typeError || !appointmentType) {
      return NextResponse.json(
        { error: 'Invalid appointment type' },
        { status: 400 }
      );
    }

    // Create appointment request
    const { data: appointmentRequest, error } = await supabase
      .from('appointment_requests')
      .insert([{
        patient_name: body.patient_name,
        patient_email: body.patient_email,
        patient_phone: body.patient_phone || null,
        patient_birth_date: body.patient_birth_date || null,
        appointment_type_id: body.appointment_type_id,
        preferred_date: body.preferred_date,
        preferred_time: body.preferred_time || null,
        alternative_dates: body.alternative_dates || [],
        chief_complaint: body.chief_complaint,
        urgency: body.urgency,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create appointment request' },
        { status: 500 }
      );
    }

    // TODO: Send confirmation email to patient
    // TODO: Send notification email to practice staff

    return NextResponse.json({
      success: true,
      message: 'Appointment request submitted successfully',
      data: appointmentRequest
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // This endpoint is protected - require authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('appointment_requests')
      .select(`
        *,
        appointment_type:appointment_types(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointment requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: requests || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
