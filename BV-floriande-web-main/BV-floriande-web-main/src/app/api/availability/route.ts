/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * API Route: Availability Check
 * Werkproces 2: Automated availability checking
 */

import { NextRequest, NextResponse } from 'next/server';
import { availabilityQueries } from '@/lib/medcheck-queries';
import { AvailabilityRequest } from '@/lib/medcheck-types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const date = searchParams.get('date');
    const appointmentTypeId = searchParams.get('appointment_type_id');
    const doctorId = searchParams.get('doctor_id');
    const locationId = searchParams.get('location_id');

    if (!date || !appointmentTypeId) {
      return NextResponse.json(
        { error: 'Date and appointment_type_id are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const requestDate = new Date(date);
    if (isNaN(requestDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Check if date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requestDate < today) {
      return NextResponse.json(
        { error: 'Cannot check availability for past dates' },
        { status: 400 }
      );
    }

    const availabilityRequest: AvailabilityRequest = {
      date,
      appointment_type_id: appointmentTypeId,
      doctor_id: doctorId || undefined,
      location_id: locationId || undefined
    };

    const timeSlots = await availabilityQueries.getAvailableTimeSlots(availabilityRequest);

    return NextResponse.json({
      success: true,
      data: {
        date,
        appointment_type_id: appointmentTypeId,
        total_slots: timeSlots.length,
        available_slots: timeSlots.filter(slot => slot.available).length,
        time_slots: timeSlots
      }
    });

  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
