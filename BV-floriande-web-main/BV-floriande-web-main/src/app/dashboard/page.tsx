/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Patient Dashboard - Personal Medical Overview
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Heart,
  Activity,
  FileText,
  Pill,
  CalendarCheck,
  Stethoscope,
  MessageSquare,
  Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface PatientStats {
  upcomingAppointments: number;
  activeMedications: number;
  lastCheckupDays: number;
  unreadMessages: number;
  pendingResults: number;
}

interface PatientActivity {
  id: string;
  type: 'appointment_confirmed' | 'test_result' | 'prescription_ready' | 'message_received' | 'reminder';
  message: string;
  timestamp: string;
  urgent?: boolean;
}

interface UpcomingAppointment {
  id: string;
  date: string;
  time: string;
  type: string;
  doctor_name: string;
  location: string;
  status: string;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PatientStats>({
    upcomingAppointments: 0,
    activeMedications: 0,
    lastCheckupDays: 0,
    unreadMessages: 0,
    pendingResults: 0
  });
  const [recentActivity, setRecentActivity] = useState<PatientActivity[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data voor patiënt dashboard
      const mockStats: PatientStats = {
        upcomingAppointments: 2,
        activeMedications: 3,
        lastCheckupDays: 5,
        unreadMessages: 1,
        pendingResults: 1
      };

      const mockActivity: PatientActivity[] = [
        {
          id: '1',
          type: 'appointment_confirmed',
          message: 'Afspraak bevestigd voor vrijdag 28 juni om 14:30',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          type: 'test_result',
          message: 'Bloedonderzoek resultaten zijn beschikbaar',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          urgent: false
        },
        {
          id: '3',
          type: 'prescription_ready',
          message: 'Medicijn recept klaar voor ophalen bij apotheek',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          type: 'message_received',
          message: 'Nieuw bericht van Dr. Huisarts ontvangen',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          type: 'reminder',
          message: 'Herinnering: Neem uw medicijnen vandaag',
          timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
        }
      ];

      const mockUpcomingAppointments: UpcomingAppointment[] = [
        { 
          id: '1', 
          date: '2025-06-28', 
          time: '14:30', 
          type: 'Controle afspraak', 
          doctor_name: 'Dr. A. Huisarts',
          location: 'Spreekkamer 1',
          status: 'confirmed' 
        },
        { 
          id: '2', 
          date: '2025-07-05', 
          time: '10:15', 
          type: 'Bloeddruk meting', 
          doctor_name: 'Verpleegkundige B. Zorg',
          location: 'Behandelkamer 2',
          status: 'scheduled' 
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
      setUpcomingAppointments(mockUpcomingAppointments);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment_confirmed': return CalendarCheck;
      case 'test_result': return FileText;
      case 'prescription_ready': return Pill;
      case 'message_received': return MessageSquare;
      case 'reminder': return Bell;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Gepland';
      case 'confirmed': return 'Bevestigd';
      case 'completed': return 'Voltooid';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welkom terug, {user?.user_metadata?.name || user?.email?.split('@')[0]}
          </h1>
          <p className="text-gray-600">
            Hier is uw persoonlijke medische overzicht voor {format(new Date(), 'EEEE d MMMM yyyy', { locale: nl })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard/appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Afspraak Maken
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Komende Afspraken</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Geplande afspraken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Medicijnen</CardTitle>
            <Pill className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeMedications}</div>
            <p className="text-xs text-muted-foreground">
              Voorgeschreven medicijnen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laatste Controle</CardTitle>
            <Stethoscope className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.lastCheckupDays}</div>
            <p className="text-xs text-muted-foreground">
              dagen geleden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongelezen Berichten</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              nieuwe berichten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Resultaten</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pendingResults}</div>
            <p className="text-xs text-muted-foreground">
              nieuwe resultaten
            </p>
          </CardContent>
        </Card>
      </div>      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mijn Komende Afspraken
            </CardTitle>
            <CardDescription>
              Overzicht van uw geplande afspraken
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-blue-600">
                      {format(new Date(appointment.date), 'dd MMM', { locale: nl })}
                      <br />
                      {appointment.time}
                    </div>
                    <div>
                      <p className="font-medium">{appointment.type}</p>
                      <p className="text-sm text-gray-500">{appointment.doctor_name}</p>
                      <p className="text-xs text-gray-400">{appointment.location}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Geen geplande afspraken
                </p>
              )}
            </div>
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/dashboard/appointments">
                  Alle Afspraken Bekijken
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recente Activiteit
            </CardTitle>
            <CardDescription>
              Laatste updates over uw medische zorg
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Icon className={`h-4 w-4 mt-0.5 ${activity.urgent ? 'text-red-500' : 'text-blue-500'}`} />
                    <div className="flex-1">
                      <p className={`text-sm ${activity.urgent ? 'font-medium text-red-700' : ''}`}>
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'dd MMM HH:mm', { locale: nl })}
                      </p>
                    </div>
                    {activity.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/medical-records">
                  Medisch Dossier Bekijken
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Patients */}
      <Card>
        <CardHeader>
          <CardTitle>Snelle Acties</CardTitle>
          <CardDescription>
            Handige links voor uw medische zorg
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/appointments">
                <Calendar className="h-6 w-6 mb-2" />
                Afspraak Maken
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/medical-records">
                <FileText className="h-6 w-6 mb-2" />
                Mijn Dossier
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/medications">
                <Pill className="h-6 w-6 mb-2" />
                Medicijnen
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/reports">
                <Stethoscope className="h-6 w-6 mb-2" />
                Test Resultaten
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
