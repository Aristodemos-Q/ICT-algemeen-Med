/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { groupService } from '@/lib/bvf-services';
import { useAuth } from '@/context/AuthContext';
import type { Group } from '@/lib/database-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Users, Calendar, Target, Settings, Edit, X } from 'lucide-react';

// Add interface for Group with trainers
interface GroupWithTrainers extends Group {
  trainers?: GroupTrainer[];
}

// Add missing type definitions
interface GroupTrainer {
  user_id: string;
  users: {
    id: string;
    email: string;
    user_metadata: any;
  };
}

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
}

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupWithTrainers[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroupForMember, setSelectedGroupForMember] = useState<string>('');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');

  // Form state for adding new group
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    level: '',
    ageCategory: '',
    maxMembers: 15
  });

  // Form state for adding new member
  const [newMember, setNewMember] = useState({
    name: '',
    dateOfBirth: '',
    contactInfo: '',
    groupNumber: 1
  });

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

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Geen gebruiker ingelogd.');
      return;
    }

    try {
      setIsLoading(true);
      
      await groupService.createGroup({
        name: newGroup.name,
        description: newGroup.description,
        level: newGroup.level,
        age_category: newGroup.ageCategory,
        max_members: newGroup.maxMembers,
        created_by: user.id
      });

      // Reset form
      setNewGroup({
        name: '',
        description: '',
        level: '',
        ageCategory: '',
        maxMembers: 15
      });
      setShowAddForm(false);
      setError(null);

      // Reload groups
      const fetchedGroups = await groupService.getAllGroups();
      setGroups(fetchedGroups);

    } catch (err) {
      console.error('Error creating group:', err);
      setError('Er is een fout opgetreden bij het aanmaken van de groep.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTrainer = async (groupId: string, trainerId: string) => {
    if (!user?.id) return;
    
    try {
      await groupService.assignTrainerToGroup(groupId, trainerId, user.id);
      // Refresh groups data
      const fetchedGroups = await groupService.getAllGroups();
      setGroups(fetchedGroups);
      setError(null);
    } catch (err) {
      console.error('Error assigning trainer:', err);
      setError('Er is een fout opgetreden bij het toewijzen van de trainer.');
    }
  };

  const handleRemoveTrainer = async (groupId: string, trainerId: string) => {
    try {
      await groupService.removeTrainerFromGroup(groupId, trainerId);
      // Refresh groups data
      const fetchedGroups = await groupService.getAllGroups();
      setGroups(fetchedGroups);
      setError(null);
    } catch (err) {
      console.error('Error removing trainer:', err);
      setError('Er is een fout opgetreden bij het verwijderen van de trainer.');
    }
  };

  if (isLoading && groups.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
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
          <h1 className="text-3xl font-bold text-primary">Groepsbeheer</h1>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary hover:bg-primary-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Groep
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Group Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nieuwe Groep Aanmaken</CardTitle>
            <CardDescription>
              Vul de gegevens in voor de nieuwe trainingsgroep
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="group-name">Groepsnaam</Label>
                  <Input
                    id="group-name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    placeholder="Bijv. Beginners Groep A"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="group-level">Niveau</Label>
                  <select
                    id="group-level"
                    value={newGroup.level}
                    onChange={(e) => setNewGroup({...newGroup, level: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    aria-label="Selecteer niveau van de groep"
                    title="Kies het niveau van de groep"
                  >
                    <option value="">Selecteer niveau</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Gevorderd">Gevorderd</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age-category">Leeftijdscategorie</Label>
                  <select
                    id="age-category"
                    value={newGroup.ageCategory}
                    onChange={(e) => setNewGroup({...newGroup, ageCategory: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    aria-label="Selecteer leeftijdscategorie van de groep"
                    title="Kies de leeftijdscategorie van de groep"
                  >
                    <option value="">Selecteer leeftijd</option>
                    <option value="U12">U12 (onder 12)</option>
                    <option value="U16">U16 (onder 16)</option>
                    <option value="U18">U18 (onder 18)</option>
                    <option value="Senioren">Senioren (18+)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="max-members">Max Aantal Leden</Label>
                  <Input
                    id="max-members"
                    type="number"
                    value={newGroup.maxMembers}
                    onChange={(e) => setNewGroup({...newGroup, maxMembers: parseInt(e.target.value)})}
                    min="1"
                    max="30"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="group-description">Beschrijving</Label>
                <Textarea
                  id="group-description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  placeholder="Korte beschrijving van de groep..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Aanmaken...' : 'Groep Aanmaken'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Annuleren
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  {group.description && (
                    <CardDescription className="mt-2">{group.description}</CardDescription>
                  )}
                </div>
                {user?.role === 'admin' && (
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Group details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {group.level && (
                    <div>
                      <span className="font-medium">Niveau:</span>
                      <p className="text-muted-foreground">{group.level}</p>
                    </div>
                  )}
                  {group.age_category && (
                    <div>
                      <span className="font-medium">Leeftijd:</span>
                      <p className="text-muted-foreground">{group.age_category}</p>
                    </div>
                  )}
                </div>

                {/* Assigned trainers section for admins */}
                {user?.role === 'admin' && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Toegewezen Trainers:</span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignTrainer(group.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="text-xs border rounded px-2 py-1"
                        defaultValue=""
                        aria-label="Selecteer trainer om toe te wijzen"
                      >
                        <option value="">Trainer toevoegen...</option>
                        {trainers
                          .filter(trainer => 
                            !group.trainers?.some(gt => gt.trainer_id === trainer.id)
                          )
                          .map(trainer => (
                            <option key={trainer.id} value={trainer.id}>
                              {trainer.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="space-y-1">
                      {group.trainers?.map((groupTrainer) => (
                        <div key={groupTrainer.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                          <span>{groupTrainer.trainer?.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTrainer(group.id, groupTrainer.trainer_id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {(!group.trainers || group.trainers.length === 0) && (
                        <p className="text-xs text-muted-foreground">Geen trainers toegewezen</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {/* Navigate to group detail */}}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Bekijken
                  </Button>
                  {user?.role === 'admin' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {/* Edit group */}}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Geen groepen gevonden</h2>
          <p className="text-muted-foreground mb-4">
            Begin met het aanmaken van je eerste trainingsgroep.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Eerste Groep Aanmaken
          </Button>
        </div>
      )}
    </div>
  );
}
