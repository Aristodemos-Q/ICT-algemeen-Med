/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar as CalendarIcon, PlusCircle, X, ChevronLeft, ChevronRight, Users, MapPin, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { sessionService, groupService, locationService, userService } from '@/lib/bvf-services';
import type { Session, Group, Location, User } from '@/lib/database-types';

// TypeScript interfaces
interface TrainingSession extends Session {
  groups?: {
    id: string;
    name: string;
  };
  locations?: {
    id: string;
    name: string;
    address?: string;
  };
  session_trainers?: Array<{
    users: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New session form state
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    group_id: '',
    start_time: '',
    end_time: '',
    location_id: '',
    recurrence_type: 'none' as 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly',
    recurrence_end_date: '',
    selectedTrainers: [] as string[]
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [sessionsData, groupsData, locationsData, trainersData] = await Promise.all([
        sessionService.getSessionsWithDetails(),
        groupService.getAllGroups(),
        locationService.getAllLocations(),
        userService.getAllTrainers()
      ]);

      setSessions(sessionsData);
      setGroups(groupsData);
      setLocations(locationsData);
      setTrainers(trainersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: nl });
  const endDate = endOfWeek(monthEnd, { locale: nl });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;

  // Build calendar grid
  for (let i = 0; i < 42; i++) {
    const formattedDate = format(day, dateFormat);
    const cloneDay = day;

    // Find sessions for this day
    const daySessions = sessions.filter(session => 
      format(new Date(session.start_time || session.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );

    days.push(
      <div
        className={`p-2 border border-gray-200 min-h-[120px] cursor-pointer hover:bg-gray-50 ${
          !isSameMonth(day, monthStart) ? 'text-gray-400 bg-gray-50' : ''
        } ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}
        key={day.toString()}
        onClick={() => setSelectedDate(cloneDay)}
      >
        <span className="text-sm font-medium">{formattedDate}</span>
        <div className="mt-1 space-y-1">
          {daySessions.slice(0, 3).map((session) => (              <div
              key={session.id}
              className={`text-xs p-1 rounded text-white cursor-pointer ${session.recurrence_type && session.recurrence_type !== 'none' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSession(session);
                setShowDetailsModal(true);
              }}
            >
              <div className="font-medium">
                {session.start_time ? format(new Date(session.start_time), 'HH:mm') : 'Tijd onbekend'}
                {session.recurrence_type && session.recurrence_type !== 'none' && (
                  <span className="ml-1">🔄</span>
                )}
              </div>
              <div className="truncate">{session.title}</div>
              {session.session_trainers && session.session_trainers.length > 0 && (
                <div className="text-xs opacity-80">
                  {session.session_trainers.map(st => st.users.name).join(', ')}
                </div>
              )}
            </div>
          ))}
          {daySessions.length > 3 && (
            <div className="text-xs text-gray-500">
              +{daySessions.length - 3} meer
            </div>
          )}
        </div>
      </div>
    );
    day = addDays(day, 1);

    if (days.length === 7) {
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleAddSession = async () => {
    if (!newSession.title || !newSession.group_id || !newSession.start_time) {
      alert('Vul alle verplichte velden in');
      return;
    }

    // Check if an end date is provided for recurring sessions
    if (newSession.recurrence_type !== 'none' && !newSession.recurrence_end_date) {
      alert('Bij herhalende sessies moet een einddatum worden ingevuld');
      return;
    }

    try {      await sessionService.createSessionWithTrainers({
        title: newSession.title,
        description: newSession.description,
        group_id: newSession.group_id,
        start_time: newSession.start_time,
        end_time: newSession.end_time || newSession.start_time,
        location_id: newSession.location_id || undefined,
        recurrence_type: newSession.recurrence_type,
        recurrence_end_date: newSession.recurrence_type !== 'none' ? newSession.recurrence_end_date : undefined,
        created_by: user?.id || ''
      }, newSession.selectedTrainers);

      // Reload sessions
      await loadInitialData();
      
      setShowAddModal(false);
      setNewSession({
        title: '',
        description: '',
        group_id: '',
        start_time: '',
        end_time: '',
        location_id: '',
        recurrence_type: 'none',
        recurrence_end_date: '',
        selectedTrainers: []
      });
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Fout bij het aanmaken van de sessie');
    }
  };

  const handleTrainerToggle = (trainerId: string) => {
    setNewSession(prev => ({
      ...prev,
      selectedTrainers: prev.selectedTrainers.includes(trainerId)
        ? prev.selectedTrainers.filter(id => id !== trainerId)
        : [...prev.selectedTrainers, trainerId]
    }));
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/trainer-dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-primary/5">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-primary">Trainingsagenda</h1>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-600 text-white">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nieuwe Sessie
          </Button>
        </div>

        {/* Calendar Navigation */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy', { locale: nl })}
              </h2>
              <Button variant="outline" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-500 bg-gray-100">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="border border-gray-200">
              {rows}
            </div>
          </CardContent>
        </Card>

        {/* Session Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Aankomende Trainingen</CardTitle>
            <CardDescription>
              Overzicht van geplande trainingen en activiteiten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions
                .filter(session => new Date(session.start_time || session.date) >= new Date())
                .sort((a, b) => new Date(a.start_time || a.date).getTime() - new Date(b.start_time || b.date).getTime())
                .slice(0, 5)
                .map(session => (                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${session.recurrence_type && session.recurrence_type !== 'none' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <h3 className="font-medium">
                          {session.title}
                          {session.recurrence_type && session.recurrence_type !== 'none' && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              Herhalend
                            </span>
                          )}
                        </h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {session.start_time ? format(new Date(session.start_time), 'dd MMM yyyy - HH:mm', { locale: nl }) : 'Tijd onbekend'}
                          </div>
                          {session.groups && (
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              {session.groups.name}
                            </div>
                          )}
                          {session.locations && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {session.locations.name}
                            </div>
                          )}
                          {session.session_trainers && session.session_trainers.length > 0 && (
                            <div className="text-xs text-blue-600">
                              Trainers: {session.session_trainers.map(st => st.users.name).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      Training
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Session Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Nieuwe Trainingssessie</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-title">Titel *</Label>
                  <Input
                    id="session-title"
                    value={newSession.title}
                    onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                    placeholder="Bijvoorbeeld: Cardio Training"
                  />
                </div>

                <div>
                  <Label htmlFor="session-group">Groep *</Label>
                  <Select 
                    value={newSession.group_id} 
                    onValueChange={(value) => setNewSession({...newSession, group_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een groep" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="session-start">Start tijd *</Label>
                  <Input
                    id="session-start"
                    type="datetime-local"
                    value={newSession.start_time}
                    onChange={(e) => setNewSession({...newSession, start_time: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="session-end">Eind tijd</Label>
                  <Input
                    id="session-end"
                    type="datetime-local"
                    value={newSession.end_time}
                    onChange={(e) => setNewSession({...newSession, end_time: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="session-location">Locatie</Label>
                  <Select 
                    value={newSession.location_id} 
                    onValueChange={(value) => setNewSession({...newSession, location_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een locatie" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Trainers</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                    {trainers.map(trainer => (
                      <div key={trainer.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`trainer-${trainer.id}`}
                          checked={newSession.selectedTrainers.includes(trainer.id)}
                          onCheckedChange={() => handleTrainerToggle(trainer.id)}
                        />
                        <Label htmlFor={`trainer-${trainer.id}`} className="text-sm">
                          {trainer.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="session-description">Beschrijving</Label>
                  <Textarea
                    id="session-description"
                    value={newSession.description}
                    onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                    placeholder="Beschrijving van de training..."
                  />
                </div>                <div>
                  <Label>Herhaling</Label>
                  <Select
                    value={newSession.recurrence_type}
                    onValueChange={(value) => setNewSession({...newSession, recurrence_type: value as 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Geen herhaling" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Geen herhaling</SelectItem>
                      <SelectItem value="daily">Dagelijks</SelectItem>
                      <SelectItem value="weekly">Wekelijks</SelectItem>
                      <SelectItem value="biweekly">Om de week</SelectItem>
                      <SelectItem value="monthly">Maandelijks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>{newSession.recurrence_type !== 'none' && (
                  <div>
                    <Label>Herhaling eindigt op</Label>
                    <Input
                      type="date"
                      value={newSession.recurrence_end_date}
                      onChange={(e) => setNewSession({...newSession, recurrence_end_date: e.target.value})}
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddSession} className="flex-1">
                    Sessie Aanmaken
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                    Annuleren
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Details Modal */}
        {showDetailsModal && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Sessie Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedSession.title}</h4>
                  {selectedSession.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedSession.description}</p>
                  )}
                </div>
                  <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {selectedSession.start_time ? 
                        format(new Date(selectedSession.start_time), 'dd MMM yyyy - HH:mm', { locale: nl }) : 
                        'Tijd onbekend'
                      }
                    </span>
                  </div>
                  
                  {selectedSession.groups && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{selectedSession.groups.name}</span>
                    </div>
                  )}
                  
                  {selectedSession.locations && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedSession.locations.name}</span>
                    </div>
                  )}
                  
                  {selectedSession.recurrence_type && selectedSession.recurrence_type !== 'none' && (
                    <div className="flex items-center gap-2 bg-green-50 p-1 rounded">
                      <CalendarIcon className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">
                        {selectedSession.recurrence_type === 'daily' && 'Dagelijks'}
                        {selectedSession.recurrence_type === 'weekly' && 'Wekelijks'}
                        {selectedSession.recurrence_type === 'biweekly' && 'Om de week'}
                        {selectedSession.recurrence_type === 'monthly' && 'Maandelijks'}
                        {selectedSession.recurrence_end_date && ` tot ${format(new Date(selectedSession.recurrence_end_date), 'dd MMM yyyy', { locale: nl })}`}
                      </span>
                    </div>
                  )}
                </div>

                {selectedSession.session_trainers && selectedSession.session_trainers.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Trainers:</h5>
                    <div className="space-y-1">
                      {selectedSession.session_trainers.map((st, index) => (
                        <div key={index} className="text-sm bg-blue-50 px-2 py-1 rounded">
                          {st.users.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button onClick={() => setShowDetailsModal(false)} className="w-full">
                    Sluiten
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}