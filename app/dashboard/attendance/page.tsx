/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useState, useEffect } from 'react';
import { sessionService, groupService, attendanceService } from '@/lib/bvf-services';
import type { Session, Group, Member, Attendance, AttendanceStatus } from '@/lib/database-types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AttendancePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: AttendanceStatus; notes: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Laad groepen bij initiële render
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setIsLoading(true);
        const fetchedGroups = await groupService.getAllGroups();
        setGroups(fetchedGroups);
      } catch (err) {
        console.error('Error loading groups:', err);
        setError('Er is een fout opgetreden bij het laden van de groepen.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGroups();
  }, []);
  
  // Laad sessies wanneer een groep wordt geselecteerd
  useEffect(() => {
    const loadGroupSessions = async () => {
      if (!selectedGroup) return;
      
      try {
        setIsLoading(true);
        
        // Haal sessies op
        const fetchedSessions = await sessionService.getSessionsByGroup(selectedGroup.id);
        setSessions(fetchedSessions);
        
        // Haal leden op
        const fetchedMembers = await groupService.getGroupMembers(selectedGroup.id);
        setGroupMembers(fetchedMembers);
        
        // Reset sessie selectie
        setSelectedSession(null);
        
      } catch (err) {
        console.error('Error loading group data:', err);
        setError('Er is een fout opgetreden bij het laden van de groepsgegevens.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGroupSessions();
  }, [selectedGroup]);
  
  // Laad bestaande aanwezigheidsgegevens wanneer een sessie wordt geselecteerd
  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedSession) return;
      
      try {
        setIsLoading(true);
          // Haal aanwezigheidsgegevens op
        const fetchedAttendance = await attendanceService.getAttendanceBySession(selectedSession.id);
          // Zet de gegevens om naar het juiste formaat
        const records: Record<string, { status: AttendanceStatus; notes: string }> = {};
        fetchedAttendance.forEach((attendance) => {
          records[attendance.member_id] = {
            status: attendance.present ? 'present' : 'absent',
            notes: ''
          };
        });
        
        setAttendanceRecords(records);
        
      } catch (err) {
        console.error('Error loading attendance data:', err);
        setError('Er is een fout opgetreden bij het laden van de aanwezigheidsgegevens.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAttendance();
  }, [selectedSession]);
  
  // Update de aanwezigheidsstatus voor een lid
  const handleStatusChange = (memberId: string, status: AttendanceStatus) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [memberId]: {
        status,
        notes: prev[memberId]?.notes || ''
      }
    }));
  };
  
  // Update de opmerking voor een lid
  const handleNoteChange = (memberId: string, notes: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [memberId]: {
        status: prev[memberId]?.status || 'present',
        notes // Changed from 'note' to 'notes' to match Attendance type
      }
    }));
  };
  
  // Sla de aanwezigheidsgegevens op
  const handleSaveAttendance = async () => {
    if (!selectedSession) return;
    
    try {
      setIsLoading(true);
      setError(null);
        // Fix the records mapping to use 'note' as expected by the service
      const records = Object.entries(attendanceRecords).map(([memberId, data]) => ({
        memberId,
        status: data.status,
        note: data.notes // Service expects 'note', not 'notes'
      }));
      
      // Aanname: we hebben de gebruikers-ID van de ingelogde trainer
      const currentUserId = 'mock-user-id'; // Dit moet worden vervangen door de echte gebruikers-ID
      
      await attendanceService.recordBulkAttendance(
        selectedSession.id,
        records,
        currentUserId
      );
      
      setSuccessMessage('Aanwezigheid succesvol opgeslagen.');
      
      // Verberg het succesbericht na 3 seconden
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error saving attendance:', err);
      setError('Er is een fout opgetreden bij het opslaan van de aanwezigheidsgegevens.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Markeer alle leden als aanwezig
  const markAllPresent = () => {
    const newRecords: Record<string, { status: AttendanceStatus; notes: string }> = {};
    groupMembers.forEach((member) => {
      newRecords[member.id] = {
        status: 'present',
        notes: attendanceRecords[member.id]?.notes || ''
      };
    });
    setAttendanceRecords(newRecords);
  };
  
  // Markeer alle leden als afwezig
  const markAllAbsent = () => {
    const newRecords: Record<string, { status: AttendanceStatus; notes: string }> = {};
    groupMembers.forEach((member) => {
      newRecords[member.id] = {
        status: 'absent',
        notes: attendanceRecords[member.id]?.notes || ''
      };
    });
    setAttendanceRecords(newRecords);
  };
  
  // Helper functie voor statuskleur
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-yellow-500';
      case 'excused':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/trainer-dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-primary/5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">Aanwezigheid Registreren</h1>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">1. Selecteer een groep</h2>
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`p-3 border rounded cursor-pointer ${selectedGroup?.id === group.id ? 'bg-blue-100 border-blue-500' : ''}`}
              >                <div className="font-medium">{group.name}</div>
                {group.level && (
                  <div className="text-sm text-gray-600">Niveau: {group.level}</div>
                )}
              </div>
            ))}
            
            {groups.length === 0 && !isLoading && (
              <p className="text-gray-500">Geen groepen gevonden.</p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">2. Selecteer een trainingsessie</h2>
          {selectedGroup ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedSession?.id === session.id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">
                    {session.title || `Sessie ${new Date(session.date).toLocaleDateString()}`}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Datum: {new Date(session.date).toLocaleDateString('nl-NL')}</div>
                    {session.start_time && (
                      <div>Tijd: {session.start_time}</div>
                    )}
                    {session.duration && (
                      <div>Duur: {session.duration} minuten</div>
                    )}
                    {session.location && (
                      <div>Locatie: {session.location}</div>
                    )}
                  </div>
                </div>
              ))}
              
              {sessions.length === 0 && !isLoading && (
                <p className="text-gray-500">Geen trainingsessies gevonden voor deze groep.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Selecteer eerst een groep.</p>
          )}
        </div>
      </div>
      
      {selectedGroup && selectedSession && (
        <>          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Aanwezigheid voor sessie van {new Date(selectedSession.date).toLocaleDateString()}</h2>
            <div className="space-x-2">
              <button
                onClick={markAllPresent}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
              >
                Allen aanwezig
              </button>
              <button
                onClick={markAllAbsent}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              >
                Allen afwezig
              </button>
              <button
                onClick={handleSaveAttendance}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={isLoading}
              >
                Opslaan
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border text-left">Naam</th>
                  <th className="py-2 px-4 border text-left">Status</th>
                  <th className="py-2 px-4 border text-left">Opmerking</th>
                </tr>
              </thead>
              <tbody>
                {groupMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="py-2 px-4 border">{member.name}</td>
                    <td className="py-2 px-4 border">
                      <div className="flex space-x-2">
                        {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(member.id, status)}
                            className={`w-6 h-6 rounded-full ${attendanceRecords[member.id]?.status === status ? getStatusColor(status) : 'bg-gray-200'}`}
                            title={status.charAt(0).toUpperCase() + status.slice(1)}
                          ></button>
                        ))}
                        <div className="ml-2 text-sm">
                          {attendanceRecords[member.id]?.status === 'present' && 'Aanwezig'}
                          {attendanceRecords[member.id]?.status === 'absent' && 'Afwezig'}
                          {attendanceRecords[member.id]?.status === 'late' && 'Te laat'}
                          {attendanceRecords[member.id]?.status === 'excused' && 'Afgemeld'}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4 border">
                      <input
                        type="text"
                        value={attendanceRecords[member.id]?.notes || ''}
                        onChange={(e) => handleNoteChange(member.id, e.target.value)}
                        className="w-full p-1 border rounded"
                        placeholder="Opmerking..."
                      />
                    </td>
                  </tr>
                ))}
                
                {groupMembers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 px-4 border text-center text-gray-500">
                      Geen leden gevonden in deze groep.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
