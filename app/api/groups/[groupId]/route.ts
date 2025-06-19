import { NextResponse } from 'next/server';
import { bvfQueries } from '@/lib/bvf-queries';

export async function GET(request: Request) {
  try {
    // Haal de query parameters op
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    
    // Controleer of group ID is meegegeven
    if (!groupId) {
      return NextResponse.json(
        { error: 'Groep ID is verplicht' },
        { status: 400 }
      );
    }
    
    // Haal groepsgegevens op met leden
    const groupData = await bvfQueries.groups.getGroupWithMembers(groupId);
    
    if (!groupData) {
      return NextResponse.json(
        { error: 'Groep niet gevonden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(groupData);
  } catch (error) {
    console.error('Error fetching group data:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het ophalen van de groepsgegevens' },
      { status: 500 }
    );
  }
}
