import { NextResponse } from 'next/server';
import { bvfQueries } from '@/lib/bvf-queries';

export async function GET(request: Request) {
  try {
    // Haal de query parameters op
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const sessionId = searchParams.get('sessionId');
    
    // Controleer of ten minste één parameter is meegegeven
    if (!groupId && !sessionId) {
      return NextResponse.json(
        { error: 'Groep ID of Sessie ID is verplicht' },
        { status: 400 }
      );
    }
    
    // Kies de juiste query op basis van de meegegeven parameters
    let result;
    
    if (sessionId && groupId) {
      // Haal de uitgevoerde oefeningen op voor een specifieke sessie en groep
      result = await bvfQueries.exercises.getCompletedExercisesForSession(sessionId, groupId);
    } else if (groupId) {
      // Haal openstaande oefeningen op voor een groep
      result = await bvfQueries.exercises.getPendingExercisesForGroup(groupId);
    } else {
      return NextResponse.json(
        { error: 'Ongeldige combinatie van parameters' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching exercises data:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het ophalen van de oefengegevens' },
      { status: 500 }
    );
  }
}
