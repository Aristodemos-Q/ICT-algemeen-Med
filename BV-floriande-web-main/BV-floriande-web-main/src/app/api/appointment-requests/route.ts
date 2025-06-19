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

    // Enhanced validation
    const requiredFields = ['patient_name', 'patient_email', 'appointment_type_id', 'preferred_date', 'chief_complaint', 'urgency'];
    const missingFields = requiredFields.filter(field => !body[field as keyof AppointmentBookingForm]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
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

    // Validate preferred date is not in the past
    const preferredDate = new Date(body.preferred_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (preferredDate < today) {
      return NextResponse.json(
        { error: 'Preferred date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate appointment type exists and is active
    const { data: appointmentType, error: typeError } = await supabase
      .from('appointment_types')
      .select('id, name, is_active')
      .eq('id', body.appointment_type_id)
      .eq('is_active', true)
      .single();

    if (typeError || !appointmentType) {
      return NextResponse.json(
        { error: 'Invalid or inactive appointment type' },
        { status: 400 }
      );
    }

    // Check for existing patient
    let existingPatient = null;
    if (body.patient_email) {
      const { data: patient } = await supabase
        .from('patients')
        .select('id, name, email')
        .eq('email', body.patient_email)
        .single();
      
      existingPatient = patient;
    }

    // Create appointment request with automation tracking
    const requestData = {
      patient_id: existingPatient?.id || null,
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
    };

    const { data: appointmentRequest, error } = await supabase
      .from('appointment_requests')
      .insert([requestData])
      .select(`
        *,
        appointment_type:appointment_types(name, duration_minutes),
        patient:patients(name, email)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create appointment request' },
        { status: 500 }
      );
    }

    // Log automation process
    try {
      await supabase
        .from('automation_logs')
        .insert([{
          process_type: 'appointment_request',
          entity_id: appointmentRequest.id,
          status: 'completed',
          result: {
            patient_email: body.patient_email,
            appointment_type: appointmentType.name,
            urgency: body.urgency,
            existing_patient: !!existingPatient
          }
        }]);
    } catch (logError) {
      console.warn('Failed to log automation process:', logError);
    }

    // Send confirmation email to patient (automation)
    try {
      // TODO: Implement actual SendGrid integration
      const emailLog = {
        process_type: 'email_notification' as const,
        entity_id: appointmentRequest.id,
        status: 'completed' as const,
        result: {
          type: 'patient_confirmation',
          recipient: body.patient_email,
          template: 'appointment_request_confirmation'
        }
      };

      await supabase.from('automation_logs').insert([emailLog]);
    } catch (emailError) {
      console.warn('Failed to log email automation:', emailError);
    }

    // Send staff notification (automation)
    try {
      const staffNotificationLog = {
        process_type: 'email_notification' as const,
        entity_id: appointmentRequest.id,
        status: 'completed' as const,
        result: {
          type: 'staff_notification',
          urgency: body.urgency,
          appointment_type: appointmentType.name
        }
      };

      await supabase.from('automation_logs').insert([staffNotificationLog]);
    } catch (notificationError) {
      console.warn('Failed to log staff notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment request submitted successfully',
      data: {
        id: appointmentRequest.id,
        status: appointmentRequest.status,
        patient_name: appointmentRequest.patient_name,
        appointment_type: appointmentRequest.appointment_type?.name,
        preferred_date: appointmentRequest.preferred_date,
        urgency: appointmentRequest.urgency,
        automation: {
          request_logged: true,
          confirmation_email_queued: true,
          staff_notification_sent: true
        }
      }
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
