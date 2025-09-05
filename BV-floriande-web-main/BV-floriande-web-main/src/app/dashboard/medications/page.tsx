/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Medicijnen - Patient Medications Overview
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Pill, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Search,
  Plus,
  Bell,
  Info,
  Heart,
  Activity
} from 'lucide-react';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

interface Medication {
  id: string;
  name: string;
  generic_name?: string;
  dosage: string;
  frequency: string;
  frequency_times: string[];
  start_date: string;
  end_date?: string;
  prescribing_doctor: string;
  status: 'active' | 'completed' | 'discontinued' | 'paused';
  instructions: string;
  side_effects?: string[];
  food_instructions?: string;
  purpose: string;
  refills_remaining?: number;
  pharmacy_info?: string;
  last_taken?: string;
  next_dose?: string;
}

interface MedicationReminder {
  id: string;
  medication_id: string;
  medication_name: string;
  time: string;
  taken: boolean;
  date: string;
}

export default function MedicationsPage() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  useEffect(() => {
    loadMedicationsData();
  }, []);

  useEffect(() => {
    // Filter medications based on search and status
    let filtered = medications;

    if (searchTerm) {
      filtered = filtered.filter(medication => 
        medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.prescribing_doctor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(medication => medication.status === statusFilter);
    }

    setFilteredMedications(filtered);
  }, [medications, searchTerm, statusFilter]);

  const loadMedicationsData = async () => {
    try {
      setIsLoading(true);
      
      // Real data only - no mock data for new accounts
      const realMedications: Medication[] = [];
      const realReminders: MedicationReminder[] = [];

      setMedications(realMedications);
      setReminders(realReminders);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsTaken = (reminderId: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, taken: true }
          : reminder
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'discontinued':
        return <XCircle className="h-4 w-4" />;
      case 'paused':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const todayReminders = reminders.filter(r => r.date === format(new Date(), 'yyyy-MM-dd'));
  const tomorrowReminders = reminders.filter(r => r.date === format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const activeMedications = medications.filter(m => m.status === 'active');

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
          <h1 className="text-3xl font-bold text-gray-900">Mijn Medicijnen</h1>
          <p className="text-gray-600 mt-1">
            Overzicht van uw medicatie en inname schema
          </p>
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Medicijn Toevoegen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actieve Medicijnen</p>
                <p className="text-2xl font-bold">{activeMedications.length}</p>
              </div>
              <Pill className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vandaag Ingenomen</p>
                <p className="text-2xl font-bold">
                  {todayReminders.filter(r => r.taken).length}/{todayReminders.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nog Te Nemen</p>
                <p className="text-2xl font-bold">
                  {todayReminders.filter(r => !r.taken).length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recepten Herhaling</p>
                <p className="text-2xl font-bold">
                  {activeMedications.reduce((sum, med) => sum + (med.refills_remaining || 0), 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Vandaag Innemen
          </CardTitle>
          <CardDescription>
            Uw medicatie schema voor {format(new Date(), 'EEEE d MMMM yyyy', { locale: nl })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayReminders.length > 0 ? (
            <div className="space-y-3">
              {todayReminders.map((reminder) => (
                <div key={reminder.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  reminder.taken ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      reminder.taken ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {reminder.taken ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{reminder.medication_name}</p>
                      <p className="text-sm text-gray-600">Om {reminder.time}</p>
                    </div>
                  </div>
                  {!reminder.taken && (
                    <Button size="sm" onClick={() => markAsTaken(reminder.id)}>
                      Markeer als Ingenomen
                    </Button>
                  )}
                  {reminder.taken && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ingenomen
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Geen medicatie vandaag
              </h3>
              <p className="text-gray-600">
                U heeft vandaag geen medicijnen meer in te nemen.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoek in medicijnen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                Actief
              </Button>
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                Alle
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

      {/* Medications List */}
      <div className="space-y-4">
        {filteredMedications.map((medication) => (
          <Card key={medication.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Pill className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                      {medication.generic_name && (
                        <p className="text-sm text-gray-600">({medication.generic_name})</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(medication.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(medication.status)}
                        {medication.status}
                      </div>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Dosering & Frequentie</h4>
                      <p className="text-sm text-gray-600">Dosering: {medication.dosage}</p>
                      <p className="text-sm text-gray-600">Frequentie: {medication.frequency}</p>
                      <p className="text-sm text-gray-600">
                        Tijden: {medication.frequency_times.join(', ')}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Behandeling</h4>
                      <p className="text-sm text-gray-600">Doel: {medication.purpose}</p>
                      <p className="text-sm text-gray-600">
                        Voorgeschreven door: {medication.prescribing_doctor}
                      </p>
                      <p className="text-sm text-gray-600">
                        Start: {format(new Date(medication.start_date), 'd MMM yyyy', { locale: nl })}
                      </p>
                      {medication.end_date && (
                        <p className="text-sm text-gray-600">
                          Eind: {format(new Date(medication.end_date), 'd MMM yyyy', { locale: nl })}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Apotheek & Herhalingen</h4>
                      {medication.pharmacy_info && (
                        <p className="text-sm text-gray-600">{medication.pharmacy_info}</p>
                      )}
                      {medication.refills_remaining !== undefined && (
                        <p className="text-sm text-gray-600">
                          Herhalingen over: {medication.refills_remaining}
                        </p>
                      )}
                      {medication.next_dose && medication.status === 'active' && (
                        <p className="text-sm text-gray-600">
                          Volgende dosis: {format(new Date(medication.next_dose), 'dd MMM HH:mm', { locale: nl })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1 flex items-center gap-1">
                        <Info className="h-4 w-4" />
                        Instructies
                      </h4>
                      <p className="text-sm text-blue-800">{medication.instructions}</p>
                      {medication.food_instructions && (
                        <p className="text-sm text-blue-700 mt-1">
                          <strong>Voedsel:</strong> {medication.food_instructions}
                        </p>
                      )}
                    </div>

                    {medication.side_effects && medication.side_effects.length > 0 && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Mogelijke Bijwerkingen
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {medication.side_effects.map((effect, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {effect}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                  {medication.status === 'active' && (
                    <>
                      <Button variant="outline" size="sm">
                        Herinnering
                      </Button>
                      {medication.refills_remaining && medication.refills_remaining <= 1 && (
                        <Button variant="outline" size="sm" className="text-orange-600">
                          Herhaal Recept
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMedications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Geen medicijnen gevonden
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'active' 
                ? 'Probeer uw zoekfilters aan te passen'
                : 'U heeft momenteel geen actieve medicijnen'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
