/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar as CalendarIcon, MapPin, Clock, Users, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { bvfQueries } from '@/lib/bvf-queries';

interface ScheduleSession {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: {
    name: string;
    address: string;
  };
  group: {
    id: string;
    name: string;
    level: string;
  };
  trainers: Array<{
    id: string;
    name: string;
  }>;
  participants_count: number;
  max_participants: number;
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load schedule data
  useEffect(() => {
    const loadSchedule = async () => {
      setIsLoading(true);
      try {
        // Load sessions for current month
        const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
        
        // This would use real API calls to get session data with trainers and locations
        const mockSessions: ScheduleSession[] = [
          {
            id: '1',
            title: 'Jeugd Training A1',
            date: '2025-01-27',
            start_time: '18:00',
            end_time: '19:30',
            location: {
              name: 'Sporthal De Floriande',
              address: 'Floriandestraat 1, Hoofddorp'
            },
            group: {
              id: 'group-1',
              name: 'Jeugd A1',
              level: 'Beginner'
            },
            trainers: [
              { id: 'trainer-1', name: 'Jan Trainer' },
              { id: 'trainer-2', name: 'Emma Coach' }
            ],
            participants_count: 12,
            max_participants: 15
          },
          {
            id: '2',
            title: 'Senioren Training',
            date: '2025-01-28',
            start_time: '20:00',
            end_time: '21:30',
            location: {
              name: 'Sporthal De Floriande',
              address: 'Floriandestraat 1, Hoofddorp'
            },
            group: {
              id: 'group-2',
              name: 'Senioren',
              level: 'Gevorderd'
            },
            trainers: [
              { id: 'trainer-1', name: 'Jan Trainer' }
            ],
            participants_count: 8,
            max_participants: 12
          }
        ];
        
        setSessions(mockSessions);
      } catch (error) {
        console.error('Error loading schedule:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedule();
  }, [currentDate]);

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
      format(new Date(session.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );

    days.push(
      <div
        className={`p-2 border border-gray-200 min-h-[140px] cursor-pointer hover:bg-gray-50 ${
          !isSameMonth(day, monthStart) ? 'text-gray-400 bg-gray-50' : ''
        } ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}
        key={day.toString()}
        onClick={() => setSelectedDate(cloneDay)}
      >
        <span className="text-sm font-medium">{formattedDate}</span>
        <div className="mt-1 space-y-1">
          {daySessions.map((session) => (
            <div
              key={session.id}
              className="text-xs p-2 rounded bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSession(session);
              }}
            >
              <div className="font-medium truncate">{session.title}</div>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                <span>{session.start_time}-{session.end_time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{session.location.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate">
                  {session.trainers.map(t => t.name).join(', ')}
                </span>
              </div>
            </div>
          ))}
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

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Trainingsagenda</h1>
          <p className="text-muted-foreground">Overzicht van alle trainingen, trainers en locaties</p>
        </div>
        <Link href="/dashboard/trainer-dashboard">
          <Button variant="outline">Terug naar Dashboard</Button>
        </Link>
      </div>

      {/* Calendar */}
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
            {['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'].map(day => (
              <div key={day} className="p-3 text-center font-medium text-gray-500 bg-gray-100">
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

      {/* Upcoming Sessions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Aankomende Trainingen</CardTitle>
          <CardDescription>
            Chronologisch overzicht van trainingen met alle details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions
              .filter(session => new Date(session.date) >= new Date())
              .sort((a, b) => new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime())
              .map(session => (
                <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{session.title}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            <span className="font-medium">Datum:</span>
                            <span>{format(new Date(session.date), 'EEEE d MMMM yyyy', { locale: nl })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-medium">Tijd:</span>
                            <span>{session.start_time} - {session.end_time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-medium">Locatie:</span>
                            <span>{session.location.name}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-medium">Groep:</span>
                            <Link href={`/dashboard/groups/${session.group.id}`}>
                              <Badge variant="outline" className="hover:bg-primary hover:text-white cursor-pointer">
                                {session.group.name} ({session.group.level})
                              </Badge>
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-primary" />
                            <span className="font-medium">Trainers:</span>
                            <div className="flex gap-1">
                              {session.trainers.map(trainer => (
                                <Badge key={trainer.id} variant="secondary">
                                  {trainer.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-medium">Deelnemers:</span>
                            <span>{session.participants_count}/{session.max_participants}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 space-y-2">
                      <Link href={`/dashboard/attendance?session=${session.id}`}>
                        <Button variant="outline" size="sm">Aanwezigheid</Button>
                      </Link>
                      <Link href={`/dashboard/exercises?session=${session.id}`}>
                        <Button variant="outline" size="sm">Oefeningen</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedSession.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSession(null)}>
                ✕
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span>{format(new Date(selectedSession.date), 'EEEE d MMMM yyyy', { locale: nl })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{selectedSession.start_time} - {selectedSession.end_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <div>{selectedSession.location.name}</div>
                  <div className="text-sm text-gray-600">{selectedSession.location.address}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{selectedSession.group.name} ({selectedSession.group.level})</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div className="flex gap-1">
                  {selectedSession.trainers.map(trainer => (
                    <Badge key={trainer.id} variant="secondary">
                      {trainer.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Deelnemers:</span>
                <Badge variant="outline">
                  {selectedSession.participants_count}/{selectedSession.max_participants}
                </Badge>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Link href={`/dashboard/groups/${selectedSession.group.id}`}>
                <Button variant="outline" className="flex-1">Groep Details</Button>
              </Link>
              <Button onClick={() => setSelectedSession(null)} className="flex-1">
                Sluiten
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
