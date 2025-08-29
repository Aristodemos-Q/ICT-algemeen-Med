/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * API route for fetching user appointments and requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Required for static export
export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');

    if (!userId && !userEmail) {
      return NextResponse.json({ error: 'User ID or email is required' }, { status: 400 });
    }

    // Get appointment requests - try by patient_id first, then by email
    let appointmentRequests: any[] = [];
    let requestsError: any = null;

    if (userId) {
      const result = await supabaseServer
        .from('appointment_requests')
        .select(`
          id,
          preferred_date,
          preferred_time,
          chief_complaint,
          status,
          created_at,
          appointment_types (
            id,
            name
          )
        `)
        .eq('patient_id', userId)
        .order('preferred_date', { ascending: true });
      
      appointmentRequests = result.data || [];
      requestsError = result.error;
    }

    // If no results with patient_id and we have an email, try by email
    if ((!appointmentRequests || appointmentRequests.length === 0) && userEmail) {
      const result = await supabaseServer
        .from('appointment_requests')
        .select(`
          id,
          preferred_date,
          preferred_time,
          chief_complaint,
          status,
          created_at,
          patient_email,
          appointment_types (
            id,
            name
          )
        `)
        .eq('patient_email', userEmail)
        .order('preferred_date', { ascending: true });
      
      appointmentRequests = result.data || [];
      requestsError = result.error;
    }

    if (requestsError) {
      console.error('Error fetching appointment requests:', requestsError);
      return NextResponse.json({ 
        error: 'Failed to fetch appointment requests',
        details: requestsError.message || requestsError
      }, { status: 500 });
    }

    // Get confirmed appointments - skip for now since we don't have data
    const appointments: any[] = [];
    const appointmentsError = null;

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }

    // Combine and format the data
    const combinedAppointments = [
      // Map appointment requests
      ...(appointmentRequests || []).map(request => ({
        id: request.id,
        date: request.preferred_date,
        time: request.preferred_time,
        type: request.appointment_types?.name || 'Onbekend type',
        doctor_name: 'Nog niet toegewezen',
        location: 'Nog niet bepaald', // No location in appointment_requests
        status: 'pending', // Map status from request
        chief_complaint: request.chief_complaint,
        notes: '', // No notes column in appointment_requests
        source: 'request',
        created_at: request.created_at
      })),
      // Map confirmed appointments
      ...(appointments || []).map((appointment: any) => {
        const scheduledDate = new Date(appointment.scheduled_at);
        return {
          id: appointment.id,
          date: scheduledDate.toISOString().split('T')[0], // Extract date part
          time: scheduledDate.toTimeString().substring(0, 5), // Extract time part (HH:MM)
          type: Array.isArray(appointment.appointment_types) 
            ? appointment.appointment_types[0]?.name || 'Onbekend type'
            : appointment.appointment_types?.name || 'Onbekend type',
          doctor_name: Array.isArray(appointment.users)
            ? appointment.users[0]?.name || 'Onbekende zorgverlener'
            : appointment.users?.name || 'Onbekende zorgverlener',
          location: Array.isArray(appointment.practice_locations)
            ? appointment.practice_locations[0]?.name || 'Onbekende locatie'
            : appointment.practice_locations?.name || 'Onbekende locatie',
          status: appointment.status,
          chief_complaint: '', // Appointments don't have chief_complaint in the current schema
          notes: appointment.notes,
          source: 'appointment',
          created_at: appointment.created_at
        };
      })
    ];

    // Sort by date and time
    combinedAppointments.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json({
      success: true,
      appointments: combinedAppointments
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
