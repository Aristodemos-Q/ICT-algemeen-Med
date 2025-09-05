/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Mijn Afspraken - Patient Appointments Overview
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  MapPin,
  User,
  Phone,
  Plus,
  Search,
  Filter,
  CalendarDays,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { appointmentQueries, appointmentRequestQueries } from '@/lib/medcheck-queries';

interface PatientAppointment {
  id: string;
  date: string;
  time: string;
  type: string;
  doctor_name: string;
  location: string;
  status: 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  chief_complaint?: string;
  notes?: string;
  source?: 'request' | 'appointment';
  created_at?: string;
}

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<PatientAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    // Filter appointments based on search and status
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(appointment => 
        appointment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id && !user?.email) {
        console.warn('No user ID or email available');
        setAppointments([]);
        return;
      }

      // Use the enhanced getAppointments function that includes offline data
      try {
        console.log('📋 Loading appointments (including offline data)...');
        const appointmentsData = await appointmentQueries.getAppointments();
        
        // Filter appointments for current user by email
        const userAppointments = appointmentsData.filter((apt: any) => 
          apt.patient?.email === user.email || 
          apt.id.startsWith('offline_') // Include all offline appointments for now
        );

        // Convert to PatientAppointment format for display
        const patientAppointments: PatientAppointment[] = userAppointments.map((apt: any) => ({
          id: apt.id,
          date: apt.scheduled_at ? new Date(apt.scheduled_at).toISOString().split('T')[0] : '',
          time: apt.scheduled_at ? new Date(apt.scheduled_at).toTimeString().substring(0, 5) : '',
          type: apt.appointment_type?.name || 'Onbekend type',
          doctor_name: apt.doctor?.name || 'Nog niet toegewezen',
          location: apt.location?.name || 'Spaarnepoort 1',
          status: apt.status === 'scheduled' ? 'pending' : apt.status, // Map scheduled to pending for display
          chief_complaint: apt.chief_complaint || '',
          notes: apt.notes || '',
          source: apt.id.startsWith('offline_') ? 'request' : 'appointment',
          created_at: apt.created_at
        }));

        setAppointments(patientAppointments);
        console.log(`✅ Loaded ${patientAppointments.length} appointments (${patientAppointments.filter(a => a.source === 'request').length} offline)`);
        
      } catch (queryError: any) {
        console.error('Query failed:', queryError);
        
        // No fallback mock data - show empty state for new accounts
        console.log('No appointments found, showing empty state for new account');
        setAppointments([]);
      }

    } catch (error) {
      console.error('Error loading appointments:', error);
      // No fallback mock data - show empty state for new accounts
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aangevraagd';
      case 'confirmed':
        return 'Bevestigd';
      case 'completed':
        return 'Voltooid';
      case 'cancelled':
        return 'Geannuleerd';
      case 'scheduled':
        return 'Ingepland';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'scheduled':
        return <CalendarDays className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const upcomingAppointments = filteredAppointments.filter(
    app => new Date(app.date) >= new Date() && app.status !== 'cancelled'
  );
  const pastAppointments = filteredAppointments.filter(
    app => new Date(app.date) < new Date() || app.status === 'completed'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mijn Afspraken</h1>
          <p className="text-gray-600 mt-1">
            Overzicht van al uw medische afspraken
          </p>
        </div>
        <Button asChild>
          <Link href="/appointment-booking">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Afspraak
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoek in afspraken..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                Alle
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
              >
                Aangevraagd
              </Button>
              <Button
                variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('scheduled')}
                size="sm"
              >
                Komend
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
                size="sm"
              >
                Voltooid
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Komende Afspraken</p>
                <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Afgelopen Afspraken</p>
                <p className="text-2xl font-bold">{pastAppointments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totaal Dit Jaar</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Komende Afspraken
            </CardTitle>
            <CardDescription>
              Uw geplande afspraken voor de komende tijd
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-sm font-medium text-blue-600">
                          {format(new Date(appointment.date), 'dd MMM yyyy', { locale: nl })}
                          <br />
                          {appointment.time}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{appointment.type}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <User className="h-3 w-3" />
                            {appointment.doctor_name}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            {appointment.location}
                          </div>
                        </div>
                      </div>
                      {appointment.chief_complaint && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Reden:</strong> {appointment.chief_complaint}
                        </p>
                      )}
                      {appointment.notes && (
                        <p className="text-sm text-gray-500">
                          <strong>Opmerkingen:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(appointment.status)}
                          {getStatusLabel(appointment.status)}
                        </div>
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                        {appointment.status === 'scheduled' && (
                          <Button variant="outline" size="sm">
                            Verzetten
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Afspraak Geschiedenis
            </CardTitle>
            <CardDescription>
              Overzicht van uw eerdere afspraken
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-sm font-medium text-gray-600">
                          {format(new Date(appointment.date), 'dd MMM yyyy', { locale: nl })}
                          <br />
                          {appointment.time}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{appointment.type}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <User className="h-3 w-3" />
                            {appointment.doctor_name}
                          </div>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600">
                          <strong>Resultaat:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(appointment.status)}
                          {getStatusLabel(appointment.status)}
                        </div>
                      </Badge>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {pastAppointments.length > 5 && (
                <div className="text-center">
                  <Button variant="outline">
                    Toon meer ({pastAppointments.length - 5} meer)
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredAppointments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Geen afspraken gevonden
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Probeer uw zoekfilters aan te passen'
                : 'U heeft nog geen afspraken gepland'
              }
            </p>
            <Button asChild>
              <Link href="/appointment-booking">
                <Plus className="h-4 w-4 mr-2" />
                Eerste Afspraak Maken
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
