/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { groupService, memberService } from '@/lib/bvf-services';
import type { Group, Member } from '@/lib/database-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Users, Mail, Phone, Calendar, Target, Plus } from 'lucide-react';

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
    const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  // New member form state
  const [newMember, setNewMember] = useState({
    name: '',
    date_of_birth: '',
    email: '',
    phone: '',
    contact_info: '',
    emergency_contact: '',
    medical_info: ''
  });

  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setIsLoading(true);
        
        // Load group details
        const groupData = await groupService.getGroupById(groupId);
        setGroup(groupData);
        
        // Load group members
        const groupMembers = await groupService.getGroupMembers(groupId);
        setMembers(groupMembers);
        
      } catch (err) {
        console.error('Error loading group data:', err);
        setError('Er is een fout opgetreden bij het laden van de groepsgegevens.');
      } finally {
        setIsLoading(false);
      }
    };

    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  // Handle adding a new member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMember.name.trim()) {
      setError('Naam is verplicht');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);      // Create the member
      const createdMember = await memberService.createMember({
        name: newMember.name,
        date_of_birth: newMember.date_of_birth || undefined,
        email: newMember.email || undefined,
        phone: newMember.phone || undefined,
        contact_info: newMember.contact_info || undefined,
        emergency_contact: newMember.emergency_contact || undefined,
        medical_info: newMember.medical_info || undefined,
      });
      
      // Add member to group
      await groupService.addMemberToGroup(createdMember.id, groupId);
      
      // Refresh the members list
      const updatedMembers = await groupService.getGroupMembers(groupId);
      setMembers(updatedMembers);
        // Reset form and close it
      setNewMember({
        name: '',
        date_of_birth: '',
        email: '',
        phone: '',
        contact_info: '',
        emergency_contact: '',
        medical_info: ''
      });
      setShowAddMemberForm(false);
      setSuccessMessage('Lid succesvol toegevoegd aan groep');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Er is een fout opgetreden bij het toevoegen van het lid.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancelAddMember = () => {
    setShowAddMemberForm(false);
    setNewMember({
      name: '',
      date_of_birth: '',
      email: '',
      phone: '',
      contact_info: '',
      emergency_contact: '',
      medical_info: ''
    });
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Groep niet gevonden</h2>
          <p className="text-muted-foreground mb-4">
            {error || 'De opgevraagde groep bestaat niet of is niet toegankelijk.'}
          </p>
          <Button asChild>
            <Link href="/dashboard/groups">
              Terug naar Groepen
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/groups">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Groepen
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground">Groepsdetails en ledenoverzicht</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/exercises?group=${groupId}`}>
              <Target className="h-4 w-4 mr-2" />
              Oefeningen
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/attendance?group=${groupId}`}>
              <Calendar className="h-4 w-4 mr-2" />
              Aanwezigheid
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Group Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Groepsinformatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Beschrijving</h4>
                <p className="text-sm text-muted-foreground">
                  {group.description || 'Geen beschrijving beschikbaar'}
                </p>
              </div>
              
              {group.level && (
                <div>
                  <h4 className="font-medium mb-1">Niveau</h4>
                  <Badge variant="secondary">{group.level}</Badge>
                </div>
              )}
              
              {group.age_category && (
                <div>
                  <h4 className="font-medium mb-1">Leeftijdscategorie</h4>
                  <Badge variant="outline">{group.age_category}</Badge>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-1">Maximaal aantal leden</h4>
                <p className="text-sm text-muted-foreground">
                  {group.max_members || 'Onbeperkt'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Aangemaakt</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(group.created_at).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Huidige leden</h4>
                <p className="text-sm text-muted-foreground">
                  {members.length} {group.max_members ? `/ ${group.max_members}` : ''} leden
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Leden ({members.length})</CardTitle>
                  <CardDescription>
                    Overzicht van alle leden in deze groep
                  </CardDescription>
                </div>                <Button size="sm" onClick={() => setShowAddMemberForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Lid Toevoegen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {members.length > 0 ? (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{member.name}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                            {member.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{member.email}</span>
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{member.phone}</span>
                              </div>
                            )}                            {member.date_of_birth && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(member.date_of_birth).toLocaleDateString('nl-NL')}
                                  {' '}({new Date().getFullYear() - new Date(member.date_of_birth).getFullYear()} jaar)
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Sinds {new Date(member.created_at).toLocaleDateString('nl-NL')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            Bewerken
                          </Button>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nog geen leden</h3>
                  <p className="text-muted-foreground mb-4">
                    Deze groep heeft nog geen leden. Begin met het toevoegen van je eerste lid.
                  </p>                  <Button onClick={() => setShowAddMemberForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Eerste Lid Toevoegen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>        </div>
      </div>

      {/* Add Member Form Modal */}
      {showAddMemberForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Nieuw Lid Toevoegen</CardTitle>
              <CardDescription>
                Voeg een nieuw lid toe aan groep {group.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <Label htmlFor="name">Naam *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Voornaam Achternaam"
                    required
                  />
                </div>                <div>
                  <Label htmlFor="date_of_birth">Geboortedatum</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={newMember.date_of_birth}
                    onChange={(e) => setNewMember({ ...newMember, date_of_birth: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="naam@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefoon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="06 12345678"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_info">Contactinformatie</Label>
                  <Textarea
                    id="contact_info"
                    value={newMember.contact_info}
                    onChange={(e) => setNewMember({ ...newMember, contact_info: e.target.value })}
                    placeholder="Aanvullende contactgegevens..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact">Noodcontact</Label>
                  <Textarea
                    id="emergency_contact"
                    value={newMember.emergency_contact}
                    onChange={(e) => setNewMember({ ...newMember, emergency_contact: e.target.value })}
                    placeholder="Naam en telefoonnummer noodcontact..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="medical_info">Medische informatie</Label>
                  <Textarea
                    id="medical_info"
                    value={newMember.medical_info}
                    onChange={(e) => setNewMember({ ...newMember, medical_info: e.target.value })}
                    placeholder="Allergieën, medicatie, beperkingen..."
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelAddMember}
                    disabled={isLoading}
                  >
                    Annuleren
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Toevoegen...' : 'Lid Toevoegen'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-md shadow-lg z-50">
          {successMessage}
        </div>
      )}
    </div>
  );
}
