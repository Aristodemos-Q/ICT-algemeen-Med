/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Medical Dashboard - Voor artsen en assistenten
 * Werkproces 2: Automatisering van afspraakverwerking
 * Werkproces 3: Database queries voor afspraken en patiënten
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Users,
  CalendarDays,
  Stethoscope,
  Activity,
  TrendingUp,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/protected-route';
import type { 
  AppointmentRequest, 
  Appointment, 
  Patient, 
  AppointmentType,
  DashboardStats 
} from '@/lib/database-types';

interface DashboardData {
  stats: DashboardStats;
  pendingRequests: AppointmentRequest[];
  todayAppointments: Appointment[];
  recentPatients: Patient[];
}

export default function MedicalDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Mock data - in een echte app zou dit van de API komen
      const mockStats: DashboardStats = {
        total_patients: 1847,
        total_appointments_today: 12,
        pending_requests: 5,
        completed_appointments_this_week: 34,
        upcoming_appointments: [],
        recent_patients: []
      };

      const mockAppointmentTypes: AppointmentType[] = [
        {
          id: '1',
          name: 'Regulier consult',
          description: 'Standaard consult bij de huisarts',
          duration_minutes: 15,
          price: 39.50,
          requires_doctor: true,
          color_code: '#3B82F6',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Verlengd consult',
          description: 'Uitgebreid consult voor complexe problemen',
          duration_minutes: 30,
          price: 65.00,
          requires_doctor: true,
          color_code: '#8B5CF6',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];

      const mockPendingRequests: AppointmentRequest[] = [
        {
          id: '1',
          patient_name: 'Maria van der Berg',
          patient_email: 'maria@email.com',
          patient_phone: '06-12345678',
          patient_birth_date: '1985-03-15',
          appointment_type_id: '1',
          preferred_date: '2025-06-25',
          preferred_time: '09:00',
          chief_complaint: 'Hoofdpijn die al een week aanhoudt, vooral aan de rechterkant. Geen koorts.',
          urgency: 'normal',
          status: 'pending',
          created_at: '2025-06-20T08:30:00Z',
          updated_at: '2025-06-20T08:30:00Z'
        },
        {
          id: '2',
          patient_name: 'Jan Pieters',
          patient_email: 'jan.pieters@email.com',
          patient_phone: '06-98765432',
          appointment_type_id: '2',
          preferred_date: '2025-06-24',
          chief_complaint: 'Vermoeidheid en gewichtsverlies de afgelopen maanden. Wil graag een uitgebreid onderzoek.',
          urgency: 'high',
          status: 'pending',
          created_at: '2025-06-19T14:15:00Z',
          updated_at: '2025-06-19T14:15:00Z'
        },
        {
          id: '3',
          patient_name: 'Sophie de Vries',
          patient_email: 'sophie.devries@email.com',
          patient_phone: '06-55544433',
          patient_birth_date: '1992-08-22',
          appointment_type_id: '1',
          preferred_date: '2025-06-26',
          preferred_time: '14:30',
          chief_complaint: 'Keelpijn en hoesten sinds 3 dagen. Geen koorts, wel wat benauwd.',
          urgency: 'normal',
          status: 'pending',
          created_at: '2025-06-20T10:45:00Z',
          updated_at: '2025-06-20T10:45:00Z'
        }
      ];

      const mockTodayAppointments: Appointment[] = [
        {
          id: '1',
          patient_id: 'patient-1',
          scheduled_at: '2025-06-20T09:00:00Z',
          end_time: '2025-06-20T09:15:00Z',
          status: 'confirmed',
          chief_complaint: 'Reguliere controle diabetes',
          follow_up_needed: false,
          created_at: '2025-06-15T10:00:00Z'
        },
        {
          id: '2',
          patient_id: 'patient-2',
          scheduled_at: '2025-06-20T10:30:00Z',
          end_time: '2025-06-20T10:45:00Z',
          status: 'arrived',
          chief_complaint: 'Bloeddruk controle',
          follow_up_needed: true,
          follow_up_date: '2025-07-20',
          created_at: '2025-06-18T14:20:00Z'
        }
      ];

      setDashboardData({
        stats: mockStats,
        pendingRequests: mockPendingRequests,
        todayAppointments: mockTodayAppointments,
        recentPatients: []
      });

      setAppointmentTypes(mockAppointmentTypes);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      
      // In een echte app zou dit naar de API gaan
      console.log('Approving request:', requestId);
      
      // Simuleer API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setDashboardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          pendingRequests: prev.pendingRequests.filter(req => req.id !== requestId)
        };
      });
      
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    try {
      setProcessingRequest(requestId);
      
      // In een echte app zou dit naar de API gaan
      console.log('Rejecting request:', requestId, 'Reason:', reason);
      
      // Simuleer API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setDashboardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          pendingRequests: prev.pendingRequests.filter(req => req.id !== requestId)
        };
      });
      
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

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
      default: return 'Normaal';
    }
  };

  const getAppointmentTypeName = (typeId?: string) => {
    const type = appointmentTypes.find(t => t.id === typeId);
    return type?.name || 'Onbekend type';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!dashboardData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Fout bij laden dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              Er ging iets mis bij het laden van de dashboard gegevens.
            </p>
            <Button onClick={loadDashboardData}>
              Opnieuw proberen
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MedCheck+ Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welkom terug, {user?.name || 'Dokter'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="/appointment-booking">
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuwe Afspraak
                  </Link>
                </Button>
                <div className="relative">
                  <Bell className="h-6 w-6 text-gray-400" />
                  {dashboardData.stats.pending_requests > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {dashboardData.stats.pending_requests}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Patiënten Totaal
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.total_patients}</div>
                <p className="text-xs text-muted-foreground">
                  Geregistreerde patiënten
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Afspraken Vandaag
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.total_appointments_today}</div>
                <p className="text-xs text-muted-foreground">
                  Geplande consulten
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Wachtende Verzoeken
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData.stats.pending_requests}
                </div>
                <p className="text-xs text-muted-foreground">
                  Afspraakverzoeken te behandelen
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Deze Week Voltooid
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData.stats.completed_appointments_this_week}
                </div>
                <p className="text-xs text-muted-foreground">
                  Afgeronde consulten
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overzicht</TabsTrigger>
              <TabsTrigger value="requests">
                Verzoeken 
                {dashboardData.stats.pending_requests > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {dashboardData.stats.pending_requests}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="appointments">Afspraken</TabsTrigger>
              <TabsTrigger value="patients">Patiënten</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Afspraken Vandaag
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(), 'EEEE d MMMM yyyy', { locale: nl })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.todayAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">
                                {format(new Date(appointment.scheduled_at), 'HH:mm')}
                              </p>
                              <Badge 
                                variant={appointment.status === 'arrived' ? 'default' : 'secondary'}
                              >
                                {appointment.status === 'confirmed' && 'Bevestigd'}
                                {appointment.status === 'arrived' && 'Aangekomen'}
                                {appointment.status === 'in_progress' && 'Bezig'}
                                {appointment.status === 'completed' && 'Voltooid'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {appointment.chief_complaint}
                            </p>
                            {appointment.follow_up_needed && (
                              <p className="text-xs text-orange-600 mt-1">
                                Follow-up: {appointment.follow_up_date}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {dashboardData.todayAppointments.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-8 w-8 mx-auto mb-2" />
                          <p>Geen afspraken vandaag</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Requests Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      Wachtende Verzoeken
                    </CardTitle>
                    <CardDescription>
                      Afspraakverzoeken die behandeling vereisen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.pendingRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{request.patient_name}</p>
                            <Badge className={getUrgencyColor(request.urgency)}>
                              {getUrgencyText(request.urgency)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {request.chief_complaint?.substring(0, 100)}...
                          </p>
                          <div className="text-xs text-gray-500">
                            {request.preferred_date && (
                              <span>Gewenste datum: {format(new Date(request.preferred_date), 'd MMM yyyy', { locale: nl })}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {dashboardData.pendingRequests.length > 3 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setSelectedTab('requests')}
                        >
                          Bekijk alle {dashboardData.pendingRequests.length} verzoeken
                        </Button>
                      )}
                      
                      {dashboardData.pendingRequests.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                          <p>Geen wachtende verzoeken</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Afspraakverzoeken Beheren</CardTitle>
                  <CardDescription>
                    Bekijk en behandel inkomende afspraakverzoeken van patiënten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {dashboardData.pendingRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{request.patient_name}</h3>
                              <Badge className={getUrgencyColor(request.urgency)}>
                                {getUrgencyText(request.urgency)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span>{request.patient_email}</span>
                                </div>
                                {request.patient_phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span>{request.patient_phone}</span>
                                  </div>
                                )}
                                {request.patient_birth_date && (
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span>Geboren: {format(new Date(request.patient_birth_date), 'd MMMM yyyy', { locale: nl })}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Stethoscope className="h-4 w-4 text-gray-400" />
                                  <span>{getAppointmentTypeName(request.appointment_type_id)}</span>
                                </div>
                                {request.preferred_date && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>
                                      {format(new Date(request.preferred_date), 'EEEE d MMMM yyyy', { locale: nl })}
                                      {request.preferred_time && ` om ${request.preferred_time}`}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>Aangevraagd: {format(new Date(request.created_at), 'd MMM yyyy HH:mm', { locale: nl })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <Label className="text-sm font-medium">Klacht:</Label>
                          <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                            {request.chief_complaint}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={processingRequest === request.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingRequest === request.id ? (
                              'Verwerken...'
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Goedkeuren
                              </>
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id, 'Niet beschikbaar op gewenste datum')}
                            disabled={processingRequest === request.id}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Afwijzen
                          </Button>
                          
                          <Button variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    ))}

                    {dashboardData.pendingRequests.length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Alle verzoeken behandeld!
                        </h3>
                        <p className="text-gray-600">
                          Er zijn momenteel geen afspraakverzoeken die behandeling vereisen.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Afspraken Beheer</CardTitle>
                  <CardDescription>
                    Bekijk en beheer alle geplande afspraken
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Afspraken Kalender
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Hier komt een interactieve kalender voor afsprakenbeheer
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/calendar">
                        Naar Kalender
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Patients Tab */}
            <TabsContent value="patients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patiënten Overzicht</CardTitle>
                  <CardDescription>
                    Zoek en beheer patiëntgegevens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Patiëntendatabase
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Hier komt het patiëntenbeheer systeem
                    </p>
                    <Button disabled>
                      Binnenkort beschikbaar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
