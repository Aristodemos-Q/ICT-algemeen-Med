/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Rapporten - Patient Test Results and Reports
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Download, Eye, FileText, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface TestResult {
  id: string;
  date: string;
  type: 'blood' | 'urine' | 'imaging' | 'biopsy' | 'cardio' | 'other';
  name: string;
  description: string;
  status: 'normal' | 'abnormal' | 'critical' | 'pending';
  doctor_name: string;
  results?: {
    parameter: string;
    value: string;
    unit: string;
    reference_range: string;
    status: 'normal' | 'high' | 'low';
  }[];
  summary?: string;
  recommendations?: string;
  file_url?: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<TestResult[]>([]);
  const [filteredReports, setFilteredReports] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadTestResults();
  }, []);

  useEffect(() => {
    // Filter reports based on search, type and status
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, typeFilter, statusFilter]);

  const loadTestResults = async () => {
    try {
      setIsLoading(true);
      
      // Mock data voor test resultaten
      const mockReports: TestResult[] = [
        {
          id: '1',
          date: '2024-06-15',
          type: 'blood',
          name: 'Volledig Bloedbeeld',
          description: 'Routine bloedonderzoek voor algemene gezondheidscheck',
          status: 'normal',
          doctor_name: 'Dr. Van der Berg',
          results: [
            {
              parameter: 'Hemoglobine',
              value: '14.2',
              unit: 'g/dL',
              reference_range: '12.0-15.5',
              status: 'normal'
            },
            {
              parameter: 'Witte bloedcellen',
              value: '6.8',
              unit: '10³/μL',
              reference_range: '4.5-11.0',
              status: 'normal'
            },
            {
              parameter: 'Cholesterol',
              value: '195',
              unit: 'mg/dL',
              reference_range: '<200',
              status: 'normal'
            }
          ],
          summary: 'Alle waarden binnen normale bereiken.',
          recommendations: 'Continueer met gezonde levensstijl.'
        },
        {
          id: '2',
          date: '2024-05-28',
          type: 'imaging',
          name: 'Röntgen Thorax',
          description: 'Controle longfoto na verkoudheid',
          status: 'normal',
          doctor_name: 'Dr. Jansen',
          summary: 'Longen zien er helder uit, geen afwijkingen zichtbaar.',
          recommendations: 'Geen verdere actie nodig.'
        },
        {
          id: '3',
          date: '2024-05-10',
          type: 'blood',
          name: 'Diabetes Screening',
          description: 'HbA1c en glucose test',
          status: 'abnormal',
          doctor_name: 'Dr. Peters',
          results: [
            {
              parameter: 'HbA1c',
              value: '6.2',
              unit: '%',
              reference_range: '<5.7',
              status: 'high'
            },
            {
              parameter: 'Nuchtere glucose',
              value: '108',
              unit: 'mg/dL',
              reference_range: '70-100',
              status: 'high'
            }
          ],
          summary: 'Licht verhoogde waarden suggereren prediabetes.',
          recommendations: 'Levensstijlaanpassingen en follow-up over 3 maanden.'
        }
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Error loading test results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normaal';
      case 'abnormal':
        return 'Afwijkend';
      case 'critical':
        return 'Kritiek';
      case 'pending':
        return 'In behandeling';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'blood':
        return 'Bloed';
      case 'urine':
        return 'Urine';
      case 'imaging':
        return 'Beeldvorming';
      case 'biopsy':
        return 'Biopsie';
      case 'cardio':
        return 'Cardiologie';
      case 'other':
        return 'Overig';
      default:
        return type;
    }
  };

  const getParameterIcon = (status: string) => {
    switch (status) {
      case 'high':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'low':
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default:
        return <Minus className="h-4 w-4 text-green-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Resultaten & Rapporten</h1>
          <p className="text-gray-500 mt-1">Overzicht van uw medische test resultaten</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zoek in rapporten..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                title="Filter op type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Alle types</option>
                <option value="blood">Bloed</option>
                <option value="urine">Urine</option>
                <option value="imaging">Beeldvorming</option>
                <option value="cardio">Cardiologie</option>
                <option value="other">Overig</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                title="Filter op status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Alle statussen</option>
                <option value="normal">Normaal</option>
                <option value="abnormal">Afwijkend</option>
                <option value="critical">Kritiek</option>
                <option value="pending">In behandeling</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusText(report.status)}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeText(report.type)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(report.date), 'dd MMMM yyyy', { locale: nl })}
                      </span>
                      <span>Dr. {report.doctor_name}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Bekijk
                    </Button>
                    {report.file_url && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">{report.description}</p>
                  
                  {report.results && report.results.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Test Resultaten:</h4>
                      <div className="space-y-2">
                        {report.results.map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              {getParameterIcon(result.status)}
                              <span className="font-medium">{result.parameter}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-sm">
                                {result.value} {result.unit}
                              </div>
                              <div className="text-xs text-gray-500">
                                Referentie: {result.reference_range}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {report.summary && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">Samenvatting:</h4>
                      <p className="text-sm text-gray-600">{report.summary}</p>
                    </div>
                  )}
                  
                  {report.recommendations && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">Aanbevelingen:</h4>
                      <p className="text-sm text-gray-600">{report.recommendations}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen rapporten gevonden</h3>
              <p className="text-gray-500">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Geen resultaten voor uw zoekopdracht. Probeer andere zoektermen.'
                  : 'U heeft nog geen test resultaten in ons systeem.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
