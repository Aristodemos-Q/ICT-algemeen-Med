/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Medisch Dossier - Patient Medical Records
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  User,
  Calendar,
  Heart,
  Activity,
  Pill,
  AlertTriangle,
  Download,
  Eye,
  Shield,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

interface PatientInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birth_date: string;
  address?: string;
  emergency_contact?: string;
  insurance_info?: string;
  patient_number: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  type: 'consultation' | 'lab_result' | 'prescription' | 'referral' | 'imaging';
  title: string;
  description: string;
  doctor_name: string;
  status: 'active' | 'completed' | 'cancelled';
  attachments?: string[];
}

interface VitalSigns {
  date: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  weight: number;
  height: number;
  temperature?: number;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  prescribing_doctor: string;
  status: 'active' | 'completed' | 'discontinued';
  instructions: string;
}

interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  date_discovered: string;
}

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMedicalData();
  }, []);

  const loadMedicalData = async () => {
    try {
      setIsLoading(true);
      
      // Real patient info based on user account
      const realPatientInfo: PatientInfo = {
        id: user?.id || '1',
        name: user?.user_metadata?.name || 'Nieuwe Patiënt',
        email: user?.email || '',
        phone: '', // No mock data - only real data
        birth_date: '', // No mock data - only real data
        address: '', // No mock data - only real data
        emergency_contact: '', // No mock data - only real data
        insurance_info: '', // No mock data - only real data
        patient_number: `P${new Date().getFullYear()}${Math.random().toString().slice(2, 8)}`
      };

      // Empty arrays for new accounts - no mock data
      const realMedicalRecords: MedicalRecord[] = [];
      const realVitalSigns: VitalSigns[] = [];
      const realMedications: Medication[] = [];
      const realAllergies: Allergy[] = [];

      setPatientInfo(realPatientInfo);
      setMedicalRecords(realMedicalRecords);
      setVitalSigns(realVitalSigns);
      setMedications(realMedications);
      setAllergies(realAllergies);
      
    } catch (error) {
      console.error('Error loading medical data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <User className="h-4 w-4" />;
      case 'lab_result':
        return <Activity className="h-4 w-4" />;
      case 'prescription':
        return <Pill className="h-4 w-4" />;
      case 'referral':
        return <FileText className="h-4 w-4" />;
      case 'imaging':
        return <Eye className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'lab_result':
        return 'bg-green-100 text-green-800';
      case 'prescription':
        return 'bg-purple-100 text-purple-800';
      case 'referral':
        return 'bg-orange-100 text-orange-800';
      case 'imaging':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMedicationStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Mijn Medisch Dossier</h1>
          <p className="text-gray-600 mt-1">
            Persoonlijke medische informatie en geschiedenis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporteren
          </Button>
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </Button>
        </div>
      </div>

      {/* Patient Information Card */}
      {patientInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Persoonlijke Gegevens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900">Basisinformatie</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <p><strong>Naam:</strong> {patientInfo.name}</p>
                  <p><strong>Patiëntnummer:</strong> {patientInfo.patient_number}</p>
                  <p><strong>Geboortedatum:</strong> {format(new Date(patientInfo.birth_date), 'd MMMM yyyy', { locale: nl })}</p>
                  <p><strong>Leeftijd:</strong> {new Date().getFullYear() - new Date(patientInfo.birth_date).getFullYear()} jaar</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Contactgegevens</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {patientInfo.email}
                  </div>
                  {patientInfo.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patientInfo.phone}
                    </div>
                  )}
                  {patientInfo.address && (
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      <span>{patientInfo.address}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Aanvullende informatie</h3>
                <div className="mt-2 space-y-2 text-sm">
                  {patientInfo.emergency_contact && (
                    <p><strong>Noodcontact:</strong> {patientInfo.emergency_contact}</p>
                  )}
                  {patientInfo.insurance_info && (
                    <p><strong>Verzekering:</strong> {patientInfo.insurance_info}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Information Tabs */}
      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="records">Medische Geschiedenis</TabsTrigger>
          <TabsTrigger value="vitals">Vitale Functies</TabsTrigger>
          <TabsTrigger value="medications">Medicatie</TabsTrigger>
          <TabsTrigger value="allergies">Allergieën</TabsTrigger>
        </TabsList>

        {/* Medical Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medische Geschiedenis</CardTitle>
              <CardDescription>
                Chronologisch overzicht van uw medische consulten en onderzoeken
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicalRecords.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-sm font-medium text-gray-600">
                            {format(new Date(record.date), 'dd MMM yyyy', { locale: nl })}
                          </div>
                          <Badge className={getRecordTypeColor(record.type)}>
                            <div className="flex items-center gap-1">
                              {getRecordTypeIcon(record.type)}
                              {record.type}
                            </div>
                          </Badge>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{record.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                        <p className="text-xs text-gray-500">
                          <strong>Arts:</strong> {record.doctor_name}
                        </p>
                        {record.attachments && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Bijlagen:</p>
                            {record.attachments.map((attachment, index) => (
                              <Button key={index} variant="outline" size="sm" className="mr-2 mb-1">
                                <Download className="h-3 w-3 mr-1" />
                                {attachment}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                          {record.status === 'completed' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {record.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vital Signs Tab */}
        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vitale Functies</CardTitle>
              <CardDescription>
                Overzicht van uw metingen en vitale functies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {vitalSigns.map((vital, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">
                        {format(new Date(vital.date), 'dd MMMM yyyy', { locale: nl })}
                      </h3>
                      <Badge variant="outline">
                        <Heart className="h-3 w-3 mr-1" />
                        Metingen
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600">Bloeddruk</p>
                        <p className="text-lg font-semibold text-red-600">
                          {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                        </p>
                        <p className="text-xs text-gray-500">mmHg</p>
                      </div>
                      
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Hartslag</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {vital.heart_rate}
                        </p>
                        <p className="text-xs text-gray-500">bpm</p>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Gewicht</p>
                        <p className="text-lg font-semibold text-green-600">
                          {vital.weight}
                        </p>
                        <p className="text-xs text-gray-500">kg</p>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Lengte</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {vital.height}
                        </p>
                        <p className="text-xs text-gray-500">cm</p>
                      </div>
                    </div>
                    
                    {vital.temperature && (
                      <div className="mt-4 text-center p-3 bg-orange-50 rounded-lg w-fit">
                        <p className="text-sm text-gray-600">Temperatuur</p>
                        <p className="text-lg font-semibold text-orange-600">
                          {vital.temperature}°C
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Huidige Medicatie</CardTitle>
              <CardDescription>
                Overzicht van uw voorgeschreven medicijnen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div key={medication.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{medication.name}</h3>
                          <Badge className={getMedicationStatusColor(medication.status)}>
                            {medication.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {medication.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {medication.status === 'discontinued' && <XCircle className="h-3 w-3 mr-1" />}
                            {medication.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Dosering:</strong> {medication.dosage}</p>
                            <p><strong>Frequentie:</strong> {medication.frequency}</p>
                            <p><strong>Voorgeschreven door:</strong> {medication.prescribing_doctor}</p>
                          </div>
                          <div>
                            <p><strong>Start datum:</strong> {format(new Date(medication.start_date), 'd MMM yyyy', { locale: nl })}</p>
                            {medication.end_date && (
                              <p><strong>Eind datum:</strong> {format(new Date(medication.end_date), 'd MMM yyyy', { locale: nl })}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm"><strong>Instructies:</strong></p>
                          <p className="text-sm text-gray-600">{medication.instructions}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allergies Tab */}
        <TabsContent value="allergies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Bekende Allergieën
              </CardTitle>
              <CardDescription>
                Belangrijke informatie over allergische reacties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allergies.length > 0 ? (
                <div className="space-y-4">
                  {allergies.map((allergy) => (
                    <div key={allergy.id} className="border rounded-lg p-4 border-red-200 bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-red-900">{allergy.allergen}</h3>
                            <Badge className={getSeverityColor(allergy.severity)}>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {allergy.severity}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-red-800 mb-2">
                            <strong>Reactie:</strong> {allergy.reaction}
                          </p>
                          
                          <p className="text-xs text-red-600">
                            <strong>Ontdekt op:</strong> {format(new Date(allergy.date_discovered), 'd MMMM yyyy', { locale: nl })}
                          </p>
                        </div>
                        
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Geen bekende allergieën
                  </h3>
                  <p className="text-gray-600">
                    Er zijn momenteel geen allergieën geregistreerd in uw dossier.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
