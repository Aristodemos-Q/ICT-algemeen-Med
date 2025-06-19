/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Main Dashboard - Medical Practice Overview
 * Werkproces 2: Automatisering van afspraakprocessen
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Mail,
  Phone,
  FileText,
  Heart,
  Activity,
  UserCheck,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface DashboardStats {
  pendingRequests: number;
  todayAppointments: number;
  totalPatients: number;
  completedAppointments: number;
  urgentRequests: number;
  automatedEmails: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment_request' | 'appointment_completed' | 'email_sent' | 'patient_registered';
  message: string;
  timestamp: string;
  urgent?: boolean;
}

interface TodayAppointment {
  id: string;
  time: string;
  patient_name: string;
  type: string;
  status: string;
  doctor_name?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    pendingRequests: 0,
    todayAppointments: 0,
    totalPatients: 0,
    completedAppointments: 0,
    urgentRequests: 0,
    automatedEmails: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userRole = user?.user_metadata?.role || 'assistant';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - in productie zou dit van de API komen
      const mockStats: DashboardStats = {
        pendingRequests: 8,
        todayAppointments: 24,
        totalPatients: 1247,
        completedAppointments: 156,
        urgentRequests: 2,
        automatedEmails: 45
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'appointment_request',
          message: 'Nieuwe afspraakverzoek van Maria van der Berg',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          urgent: false
        },
        {
          id: '2',
          type: 'email_sent',
          message: 'Bevestigingsmail verzonden naar Jan Janssen',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'appointment_request',
          message: 'URGENT: Spoedverzoek van Emma de Vries',
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          urgent: true
        },
        {
          id: '4',
          type: 'appointment_completed',
          message: 'Afspraak voltooid - Lisa Bakker',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          type: 'patient_registered',
          message: 'Nieuwe patiënt geregistreerd: Tom de Jong',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        }
      ];

      const mockTodayAppointments: TodayAppointment[] = [
        { id: '1', time: '09:00', patient_name: 'Maria van der Berg', type: 'Regulier consult', status: 'scheduled', doctor_name: 'Dr. A. Huisarts' },
        { id: '2', time: '09:15', patient_name: 'Jan Janssen', type: 'Bloeddruk controle', status: 'confirmed', doctor_name: 'Dr. A. Huisarts' },
        { id: '3', time: '09:30', patient_name: 'Emma de Vries', type: 'Verlengd consult', status: 'in_progress', doctor_name: 'Dr. B. Praktijk' },
        { id: '4', time: '10:00', patient_name: 'Lisa Bakker', type: 'Uitslagbespreking', status: 'completed', doctor_name: 'Dr. A. Huisarts' },
        { id: '5', time: '10:30', patient_name: 'Tom de Jong', type: 'Intake nieuw patient', status: 'scheduled', doctor_name: 'Dr. B. Praktijk' }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
      setTodayAppointments(mockTodayAppointments);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment_request': return Calendar;
      case 'appointment_completed': return CheckCircle;
      case 'email_sent': return Mail;
      case 'patient_registered': return UserCheck;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Gepland';
      case 'confirmed': return 'Bevestigd';
      case 'in_progress': return 'Bezig';
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
            Welkom terug, {user?.user_metadata?.name || user?.email}
          </h1>
          <p className="text-gray-600">
            Hier is een overzicht van uw praktijk op {format(new Date(), 'EEEE d MMMM yyyy', { locale: nl })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard/appointment-requests">
              <AlertCircle className="h-4 w-4 mr-2" />
              Verzoeken Bekijken
            </Link>
          </Button>
          {userRole === 'admin' && (
            <Button variant="outline" asChild>
              <Link href="/dashboard/email-automation">
                <Mail className="h-4 w-4 mr-2" />
                E-mail Automation
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Openstaande Verzoeken</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.urgentRequests > 0 && (
                <span className="text-red-600 font-medium">
                  {stats.urgentRequests} urgent
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vandaag Afspraken</CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Geplande consulten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Patiënten</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Geregistreerde patiënten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voltooid Vandaag</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Afgeronde consulten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto E-mails</CardTitle>
            <Mail className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.automatedEmails}</div>
            <p className="text-xs text-muted-foreground">
              Verzonden vandaag
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              Automation rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agenda van Vandaag
            </CardTitle>
            <CardDescription>
              Overzicht van alle afspraken voor vandaag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-blue-600">
                      {appointment.time}
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patient_name}</p>
                      <p className="text-sm text-gray-500">{appointment.type}</p>
                      {appointment.doctor_name && (
                        <p className="text-xs text-gray-400">{appointment.doctor_name}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Geen afspraken voor vandaag
                </p>
              )}
            </div>
            <div className="mt-4">
              <Button variant="outline" asChild className="w-full">
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
              Laatste gebeurtenissen en automatiseringen
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
                        {format(new Date(activity.timestamp), 'HH:mm', { locale: nl })}
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
                <Link href="/dashboard/activity-log">
                  Alle Activiteit Bekijken
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Snelle Acties</CardTitle>
          <CardDescription>
            Veelgebruikte functies voor dagelijks gebruik
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/appointment-requests">
                <AlertCircle className="h-6 w-6 mb-2" />
                Verzoeken Behandelen
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/patients/new">
                <Users className="h-6 w-6 mb-2" />
                Nieuwe Patiënt
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/appointments/new">
                <Calendar className="h-6 w-6 mb-2" />
                Afspraak Plannen
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/email-automation">
                <Mail className="h-6 w-6 mb-2" />
                E-mail Templates
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
