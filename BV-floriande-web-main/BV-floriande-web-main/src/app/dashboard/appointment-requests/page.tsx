/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Appointment Requests Management
 * Werkproces 2: Automatisering van afspraakprocessen
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  User,
  Filter,
  Search,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

interface AppointmentRequest {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  patient_birth_date?: string;
  appointment_type: {
    name: string;
    duration_minutes: number;
    color_code: string;
  };
  preferred_date: string;
  preferred_time?: string;
  chief_complaint: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'scheduled' | 'rejected';
  created_at: string;
  processed_by?: string;
  processed_at?: string;
  rejection_reason?: string;
}

export default function AppointmentRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    doctor_id: '',
    location_id: '',
    notes: ''
  });

  useEffect(() => {
    loadAppointmentRequests();
  }, []);

  const loadAppointmentRequests = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - in productie van API
      const mockRequests: AppointmentRequest[] = [
        {
          id: '1',
          patient_name: 'Maria van der Berg',
          patient_email: 'maria@example.com',
          patient_phone: '06-12345678',
          patient_birth_date: '1985-03-15',
          appointment_type: {
            name: 'Regulier consult',
            duration_minutes: 15,
            color_code: '#3B82F6'
          },
          preferred_date: '2025-01-25',
          preferred_time: '10:00',
          chief_complaint: 'Hoofdpijn en koorts sinds 2 dagen. Mogelijk griep.',
          urgency: 'normal',
          status: 'pending',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          patient_name: 'Emma de Vries',
          patient_email: 'emma@example.com',
          patient_phone: '06-87654321',
          appointment_type: {
            name: 'Verlengd consult',
            duration_minutes: 30,
            color_code: '#8B5CF6'
          },
          preferred_date: '2025-01-24',
          chief_complaint: 'Aanhoudende buikpijn, mogelijk IBS gerelateerd. Wil uitgebreide bespreking.',
          urgency: 'urgent',
          status: 'pending',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          patient_name: 'Jan Janssen',
          patient_email: 'jan@example.com',
          appointment_type: {
            name: 'Bloeddruk controle',
            duration_minutes: 10,
            color_code: '#84CC16'
          },
          preferred_date: '2025-01-26',
          preferred_time: '14:30',
          chief_complaint: 'Routine bloeddruk controle na medicatie aanpassing.',
          urgency: 'low',
          status: 'approved',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          processed_by: 'Dr. A. Huisarts',
          processed_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        }
      ];

      setRequests(mockRequests);
    } catch (error) {
      console.error('Error loading appointment requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      // Update status to approved and prepare for scheduling
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'approved', processed_by: user?.email, processed_at: new Date().toISOString() }
            : req
        )
      );
      
      // Send automatic approval email
      await sendAutomaticEmail(requestId, 'approved');
      
      // Open scheduling modal
      const request = requests.find(r => r.id === requestId);
      if (request) {
        setSelectedRequest(request);
        setScheduleData({
          date: request.preferred_date,
          time: request.preferred_time || '',
          doctor_id: '',
          location_id: '',
          notes: ''
        });
        setShowScheduleModal(true);
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    try {
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'rejected', 
                rejection_reason: reason,
                processed_by: user?.email, 
                processed_at: new Date().toISOString() 
              }
            : req
        )
      );
      
      // Send automatic rejection email
      await sendAutomaticEmail(requestId, 'rejected', reason);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const sendAutomaticEmail = async (requestId: string, type: 'approved' | 'rejected' | 'scheduled', reason?: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // In productie zou dit een SendGrid API call zijn
      console.log('Sending automatic email:', {
        to: request.patient_email,
        type,
        requestData: request,
        reason
      });

      // Mock API call for email automation
      const emailData = {
        to: request.patient_email,
        template: type,
        data: {
          patient_name: request.patient_name,
          appointment_type: request.appointment_type.name,
          preferred_date: request.preferred_date,
          reason: reason
        }
      };

      // Simulate SendGrid API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Automatische ${type === 'approved' ? 'goedkeuring' : type === 'rejected' ? 'afwijzing' : 'bevestiging'} e-mail verzonden naar ${request.patient_email}`);
    } catch (error) {
      console.error('Error sending automatic email:', error);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.patient_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesUrgency && matchesStatus;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Afspraakverzoeken</h1>
          <p className="text-gray-600">
            Beheer en automatiseer afspraakverzoeken van patiënten
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="destructive">
            {requests.filter(r => r.status === 'pending').length} openstaand
          </Badge>
          <Badge variant="outline">
            {requests.filter(r => r.urgency === 'urgent').length} urgent
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Zoeken</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Naam of e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="pending">In behandeling</SelectItem>
                  <SelectItem value="approved">Goedgekeurd</SelectItem>
                  <SelectItem value="scheduled">Ingepland</SelectItem>
                  <SelectItem value="rejected">Afgewezen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="urgency">Urgentie</Label>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle urgentie</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">Hoog</SelectItem>
                  <SelectItem value="normal">Normaal</SelectItem>
                  <SelectItem value="low">Laag</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('pending');
                setUrgencyFilter('all');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className={request.urgency === 'urgent' ? 'border-red-200 bg-red-50' : ''}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{request.patient_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {request.patient_email}
                        {request.patient_phone && (
                          <>
                            <Phone className="h-4 w-4 ml-2" />
                            {request.patient_phone}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency === 'urgent' ? 'Urgent' :
                         request.urgency === 'high' ? 'Hoog' :
                         request.urgency === 'normal' ? 'Normaal' : 'Laag'}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status === 'pending' ? 'In behandeling' :
                         request.status === 'approved' ? 'Goedgekeurd' :
                         request.status === 'scheduled' ? 'Ingepland' : 'Afgewezen'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Type afspraak:</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: request.appointment_type.color_code }}
                        />
                        <span>{request.appointment_type.name}</span>
                        <span className="text-gray-500">({request.appointment_type.duration_minutes} min)</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Gewenste datum/tijd:</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(request.preferred_date), 'EEEE d MMMM yyyy', { locale: nl })}
                          {request.preferred_time && ` om ${request.preferred_time}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Klachtomschrijving:</p>
                    <p className="text-gray-900">{request.chief_complaint}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Aangevraagd: {format(new Date(request.created_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                    </span>
                    {request.processed_at && (
                      <span>
                        Behandeld door {request.processed_by} op {format(new Date(request.processed_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  {request.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveRequest(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Goedkeuren
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const reason = prompt('Reden voor afwijzing:');
                          if (reason) handleRejectRequest(request.id, reason);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Afwijzen
                      </Button>
                    </>
                  )}
                  
                  {request.status === 'approved' && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowScheduleModal(true);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Inplannen
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => sendAutomaticEmail(request.id, 'approved')}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    E-mail
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Geen verzoeken gevonden
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'pending' || urgencyFilter !== 'all'
                  ? 'Probeer andere filters of zoektermen'
                  : 'Er zijn momenteel geen openstaande afspraakverzoeken'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
