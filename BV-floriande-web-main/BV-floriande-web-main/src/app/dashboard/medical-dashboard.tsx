/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Medical Dashboard - Main dashboard for doctors and assistants
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Stethoscope,
  FileText,
  Phone
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  dashboardQueries, 
  appointmentRequestQueries, 
  automationQueries 
} from '@/lib/medcheck-queries';
import { DashboardStats, AppointmentRequest, AutomationLog } from '@/lib/medcheck-types';
import Link from 'next/link';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export default function MedicalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<AppointmentRequest[]>([]);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Load real data from database
        const [dashboardStats, requests] = await Promise.all([
          dashboardQueries.getDashboardStats(),
          appointmentRequestQueries.getPendingRequests()
        ]);

        setStats(dashboardStats);
        setPendingRequests(requests);

        // Load recent automation logs
        try {
          const { data: logs } = await supabase
            .from('automation_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          
          setAutomationLogs(logs || []);
        } catch (logError) {
          console.warn('Could not load automation logs:', logError);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
      
      // Set up real-time updates
      const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'Urgent';
      case 'high': return 'Hoog';
      case 'normal': return 'Normaal';
      case 'low': return 'Laag';
      default: return urgency;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header with real-time indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welkom terug, {user?.name}. Hier is een overzicht van vandaag.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live data
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Patiënten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_patients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Geregistreerde patiënten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Afspraken Vandaag</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_appointments_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              Geplande afspraken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wachtende Verzoeken</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.pending_requests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Nieuwe aanvragen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deze Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.completed_appointments_this_week || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Afgeronde afspraken
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Process Automation Monitor */}
      {automationLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Proces Automatisering (Werkproces 2)
            </CardTitle>
            <CardDescription>
              Recente geautomatiseerde processen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {automationLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">
                        {log.process_type.replace('_', ' ')}
                      </span>
                      <Badge 
                        variant={log.status === 'completed' ? 'default' : 
                                log.status === 'failed' ? 'destructive' : 'secondary'}
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Entity: {log.entity_id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Appointment Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Wachtende Afspraakverzoeken
            </CardTitle>
            <CardDescription>
              Nieuwe verzoeken die nog moeten worden behandeld
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>Geen wachtende verzoeken</p>
                <p className="text-sm">Alle aanvragen zijn behandeld</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{request.patient_name}</p>
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {getUrgencyText(request.urgency)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {request.chief_complaint}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.preferred_date && format(new Date(request.preferred_date), 'dd MMM yyyy', { locale: nl })}
                        {request.preferred_time && ` om ${request.preferred_time}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/appointment-requests/${request.id}`}>
                          Bekijken
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {pendingRequests.length > 5 && (
                  <div className="text-center pt-3">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/appointment-requests">
                        Alle {pendingRequests.length} verzoeken bekijken
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Komende Afspraken
            </CardTitle>
            <CardDescription>
              Afspraken voor vandaag en de komende dagen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!stats?.upcoming_appointments || stats.upcoming_appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Geen komende afspraken</p>
                <p className="text-sm">De agenda is momenteel leeg</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcoming_appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {appointment.patient?.name || 'Onbekende patiënt'}
                        </p>
                        <Badge variant="outline">
                          {appointment.appointment_type?.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {appointment.chief_complaint || 'Geen beschrijving'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(appointment.scheduled_at), 'dd MMM yyyy \'om\' HH:mm', { locale: nl })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/appointments/${appointment.id}`}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-auto p-4 flex-col gap-2">
              <Link href="/dashboard/appointments/new">
                <Calendar className="h-6 w-6" />
                <span>Nieuwe Afspraak</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/dashboard/patients/new">
                <Users className="h-6 w-6" />
                <span>Nieuwe Patiënt</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/dashboard/patients">
                <FileText className="h-6 w-6" />
                <span>Patiëntendossiers</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/dashboard/appointment-requests">
                <AlertCircle className="h-6 w-6" />
                <span>Afspraakverzoeken</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Patients */}
      {stats?.recent_patients && stats.recent_patients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Recent Toegevoegde Patiënten
            </CardTitle>
            <CardDescription>
              Nieuw geregistreerde patiënten in het systeem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stats.recent_patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-600">{patient.email}</p>
                    <p className="text-xs text-gray-500">
                      {patient.birth_date && format(new Date(patient.birth_date), 'dd MMM yyyy', { locale: nl })}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/patients/${patient.id}`}>
                      Bekijken
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
