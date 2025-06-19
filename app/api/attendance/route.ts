import { NextResponse } from 'next/server';
import { bvfQueries } from '@/lib/bvf-queries';

export async function GET(request: Request) {
  try {
    // Haal de query parameters op
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    // Controleer of sessie ID is meegegeven
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Sessie ID is verplicht' },
        { status: 400 }
      );
    }
    
    // Haal aanwezigheidsgegevens op voor sessie
    const attendanceData = await bvfQueries.sessions.getAttendanceForSession(sessionId);
    
    return NextResponse.json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het ophalen van de aanwezigheidsgegevens' },
      { status: 500 }
    );
  }
}
