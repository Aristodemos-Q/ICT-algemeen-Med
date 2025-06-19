import { NextResponse } from 'next/server';
import { bvfQueries } from '@/lib/bvf-queries';

export async function GET(request: Request) {
  try {
    // Haal de query parameters op
    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get('trainerId');
    
    // Controleer of trainer ID is meegegeven
    if (!trainerId) {
      return NextResponse.json(
        { error: 'Trainer ID is verplicht' },
        { status: 400 }
      );
    }
    
    // Haal dashboard gegevens op
    const dashboardData = await bvfQueries.dashboard.getTrainerDashboardData(trainerId);
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het ophalen van de dashboardgegevens' },
      { status: 500 }
    );
  }
}
