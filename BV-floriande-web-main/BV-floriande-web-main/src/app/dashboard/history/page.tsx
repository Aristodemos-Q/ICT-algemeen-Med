/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Geschiedenis - Patient Medical History
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, FileText, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface MedicalHistory {
  id: string;
  date: string;
  type: 'consultation' | 'checkup' | 'treatment' | 'emergency' | 'followup';
  title: string;
  description: string;
  doctor_name: string;
  location: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  attachments?: string[];
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<MedicalHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<MedicalHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  useEffect(() => {
    // Filter history based on search and type
    let filtered = history;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    setFilteredHistory(filtered);
  }, [history, searchTerm, typeFilter]);

  const loadMedicalHistory = async () => {
    try {
      setIsLoading(true);
      
      // Real data only - no mock history for new accounts
      const realHistory: MedicalHistory[] = [];

      setHistory(realHistory);
    } catch (error) {
      console.error('Error loading medical history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'checkup':
        return 'bg-green-100 text-green-800';
      case 'treatment':
        return 'bg-orange-100 text-orange-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'followup':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consult';
      case 'checkup':
        return 'Controle';
      case 'treatment':
        return 'Behandeling';
      case 'emergency':
        return 'Spoed';
      case 'followup':
        return 'Follow-up';
      default:
        return type;
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
          <h1 className="text-3xl font-bold text-gray-900">Medische Geschiedenis</h1>
          <p className="text-gray-500 mt-1">Overzicht van uw eerdere consulten en behandelingen</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zoek in geschiedenis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>            <div className="sm:w-48">
              <select
                title="Filter op type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Alle types</option>
                <option value="consultation">Consulten</option>
                <option value="checkup">Controles</option>
                <option value="treatment">Behandelingen</option>
                <option value="emergency">Spoed</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Timeline */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge className={getTypeColor(item.type)}>
                        {getTypeText(item.type)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(item.date), 'dd MMMM yyyy', { locale: nl })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {item.doctor_name}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-700">{item.description}</p>
                  
                  {item.diagnosis && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">Diagnose:</h4>
                      <p className="text-sm text-gray-600">{item.diagnosis}</p>
                    </div>
                  )}
                  
                  {item.treatment && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">Behandeling:</h4>
                      <p className="text-sm text-gray-600">{item.treatment}</p>
                    </div>
                  )}
                  
                  {item.notes && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">Notities:</h4>
                      <p className="text-sm text-gray-600">{item.notes}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">Locatie: {item.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen geschiedenis gevonden</h3>
              <p className="text-gray-500">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Geen resultaten voor uw zoekopdracht. Probeer andere zoektermen.'
                  : 'U heeft nog geen medische geschiedenis in ons systeem.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
