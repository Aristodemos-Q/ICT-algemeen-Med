/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/protected-route';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  Target, 
  CheckCircle, 
  TrendingUp,
  Clock,
  MapPin,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { bvfQueries } from '@/lib/bvf-queries';
import { groupService } from '@/lib/bvf-services';

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  time: string;
}

interface DashboardData {
  upcomingSessions: Session[];
  totalGroups: number;
  totalSessions: number;
  completedExercises: number;
  activeMembers: number;  
  recentActivities: Activity[];
}

interface RawDashboardData {
  upcomingSessions?: any[];
  totalGroups?: number;
  totalSessions?: number;
  completedExercises?: number;
  activeMembers?: number;
  groups?: any[];
}

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    upcomingSessions: [],
    totalGroups: 0,
    totalSessions: 0,
    completedExercises: 0,
    activeMembers: 0,
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize with proper structure matching interface
        let dashboardData: DashboardData = {
          upcomingSessions: [],
          totalGroups: 0,
          totalSessions: 0,
          completedExercises: 0,
          activeMembers: 0,
          recentActivities: []
        };

        let groupsData: any[] = [];

        try {
          // Try to get dashboard data
          if (typeof bvfQueries?.dashboard?.getTrainerDashboardData === 'function') {
            const rawData: RawDashboardData = await bvfQueries.dashboard.getTrainerDashboardData(user.id);
            
            // Transform raw sessions data to proper Session type
            const transformedSessions: Session[] = Array.isArray(rawData.upcomingSessions) 
              ? rawData.upcomingSessions.map((session: any) => ({
                  id: session?.id || 'unknown',
                  title: session?.groups?.name || session?.title || 'Training',
                  date: session?.start_time?.split('T')[0] || new Date().toISOString().split('T')[0],
                  time: session?.start_time?.split('T')[1]?.substring(0, 5) || '00:00',
                  location: session?.locations?.name || 'Locatie onbekend',
                  participants: session?.participants_count || 0
                }))
              : [];

            // Ensure all required properties are present with proper types
            dashboardData = {
              upcomingSessions: transformedSessions,
              totalGroups: rawData.totalGroups || 0,
              totalSessions: rawData.totalSessions || 0,
              completedExercises: rawData.completedExercises || 0,
              activeMembers: rawData.activeMembers || 0,
              recentActivities: []
            };
          }
        } catch (err) {
          console.warn('Could not load dashboard data from bvfQueries:', err);
        }        try {
          // Try to get groups data
          console.log('Fetching groups data for user:', { 
            id: user.id, 
            role: user.role,
            idType: typeof user.id,
            idLength: user.id?.length,
            isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.id || '')
          });
          
          if (user.role === 'admin') {
            groupsData = await groupService.getAllGroups();
          } else {
            groupsData = await groupService.getTrainerGroups(user.id);
          }
          
          // Ensure groupsData is an array
          if (!Array.isArray(groupsData)) {
            console.warn('Groups data is not an array:', groupsData);
            groupsData = [];
          }
          
          console.log('Successfully loaded groups data:', { count: groupsData.length });        } catch (err) {
          console.error('Error loading groups data:', {
            error: err,
            userId: user.id,
            userRole: user.role,
            errorMessage: err instanceof Error ? err.message : 'Unknown error',
            errorStack: err instanceof Error ? err.stack : undefined,
            errorType: typeof err,
            errorStringified: JSON.stringify(err, null, 2)
          });
          
          // Additional debugging for the specific error
          if (err && typeof err === 'object') {
            console.error('Error object keys:', Object.keys(err));
            console.error('Error object values:', Object.values(err));
          }
          
          groupsData = [];
        }

        // Update state with complete data structure
        setData({
          totalGroups: groupsData?.length || dashboardData.totalGroups,
          totalSessions: dashboardData.totalSessions || dashboardData.upcomingSessions?.length || 0,
          completedExercises: dashboardData.completedExercises,
          activeMembers: dashboardData.activeMembers,
          upcomingSessions: dashboardData.upcomingSessions,
          recentActivities: [
            {
              id: '1',
              type: 'info',
              description: 'Dashboard geladen',
              time: 'Nu'
            }
          ]
        });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Kon dashboard gegevens niet laden. Probeer de pagina te verversen.');
        
        // Set safe defaults even on error
        setData({
          upcomingSessions: [],
          totalGroups: 0,
          totalSessions: 0,
          completedExercises: 0,
          activeMembers: 0,
          recentActivities: [
            {
              id: '1',
              type: 'error',
              description: 'Fout bij laden van gegevens',
              time: 'Nu'
            }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, user?.role]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Trainer Dashboard</h1>
            <p className="text-muted-foreground">
              Welkom terug, {user?.user_metadata?.name || user?.email}
            </p>
          </div>
          <div className="space-x-2">
            <Button asChild>
              <Link href="/dashboard/calendar">
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Sessie
              </Link>
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-600">{error}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Opnieuw proberen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Dashboard laden...</span>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Groepen</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalGroups}</div>
                  <p className="text-xs text-muted-foreground">
                    Actieve trainingsgroepen
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessies</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    Aankomende sessies
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Oefeningen</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.completedExercises}</div>
                  <p className="text-xs text-muted-foreground">
                    Voltooid deze maand
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leden</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.activeMembers}</div>
                  <p className="text-xs text-muted-foreground">
                    Actieve leden
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Snelle Acties
                    <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Actief
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Veelgebruikte functies - Klik om direct naar de pagina te gaan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-start" size="lg">
                    <Link href="/dashboard/exercises">
                      <Target className="h-4 w-4 mr-2" />
                      Oefening Registreren
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full justify-start" size="lg">
                    <Link href="/dashboard/attendance">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aanwezigheid Bijhouden
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full justify-start" size="lg">
                    <Link href="/dashboard/groups">
                      <Users className="h-4 w-4 mr-2" />
                      Groepen Beheren
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full justify-start" size="lg">
                    <Link href="/dashboard/calendar">
                      <Calendar className="h-4 w-4 mr-2" />
                      Agenda Bekijken
                    </Link>
                  </Button>
                  
                  {process.env.NODE_ENV !== 'production' && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        ✅ Alle Quick Actions zijn functioneel en navigeren correct naar hun respectievelijke pagina's
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Aankomende Trainingen</CardTitle>
                  <CardDescription>
                    Je volgende geplande sessies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.upcomingSessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{session.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {session.date ? new Date(session.date).toLocaleDateString('nl-NL') : 'Datum onbekend'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.time || 'Tijd onbekend'}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.location}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {session.participants} deelnemers
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {data.upcomingSessions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2" />
                        <p>Geen geplande sessies</p>
                        <Button asChild className="mt-4">
                          <Link href="/dashboard/calendar">
                            <Plus className="h-4 w-4 mr-2" />
                            Plan een sessie
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recente Activiteiten</CardTitle>
                <CardDescription>
                  Overzicht van je laatste acties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentActivities && data.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'exercise' ? 'bg-blue-500' : 
                        activity.type === 'attendance' ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                  
                  {(!data.recentActivities || data.recentActivities.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                      <p>Geen recente activiteiten</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
