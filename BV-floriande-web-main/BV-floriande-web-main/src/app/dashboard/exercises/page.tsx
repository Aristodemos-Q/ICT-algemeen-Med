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
import { exerciseService, groupService, sessionService } from '@/lib/bvf-services';
import { useAuth } from '@/context/AuthContext';
import type { Exercise, Group, Session, CompletedExercise } from '@/lib/database-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Replace sonner import
import { supabase } from '@/lib/supabaseClient'; // Add missing import

export default function ExercisesPage() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  const [pendingExercises, setPendingExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Formulier staat voor oefening voltooien
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [setsCount, setSetsCount] = useState<number>(3);
  const [repsCount, setRepsCount] = useState<number>(10);
  const [duration, setDuration] = useState<number>(15);
  const [comments, setComments] = useState<string>('');
  
  // Nieuwe staat voor het maken van oefeningen
  const [exerciseName, setExerciseName] = useState<string>('');
  const [exerciseDescription, setExerciseDescription] = useState<string>('');
  const [exerciseCategory, setExerciseCategory] = useState<string>('');
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [exerciseInstructions, setExerciseInstructions] = useState<string>('');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null); // State for editing exercise

  // Voeg categorieën en moeilijkheidsniveaus toe
  const exerciseCategories = [
    { value: 'dribbling', label: 'Dribbelen' },
    { value: 'shooting', label: 'Schieten' },
    { value: 'passing', label: 'Passen' },
    { value: 'defense', label: 'Verdediging' },
    { value: 'conditioning', label: 'Conditie' },
    { value: 'teamwork', label: 'Teamwork' },
    { value: 'fundamentals', label: 'Basis vaardigheden' }
  ];

  const difficultyLevels = [
    { value: 1, label: 'Beginner' },
    { value: 2, label: 'Gemiddeld' },
    { value: 3, label: 'Gevorderd' },
    { value: 4, label: 'Expert' },
    { value: 5, label: 'Professioneel' }
  ];

  // Laad groepen en oefeningen bij initiële render
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [fetchedGroups, fetchedExercises] = await Promise.all([
          groupService.getAllGroups(),
          exerciseService.getAllExercises()
        ]);
        
        setGroups(fetchedGroups);
        setExercises(fetchedExercises);
        setPendingExercises(fetchedExercises); // Initially all exercises are pending
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Er is een fout opgetreden bij het laden van de gegevens.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Laad sessies wanneer een groep wordt geselecteerd
  useEffect(() => {
    const loadGroupSessions = async () => {
      if (!selectedGroup) return;
      
      try {
        setIsLoading(true);
        const fetchedSessions = await sessionService.getSessionsByGroup(selectedGroup.id);
        setSessions(fetchedSessions);
        setSelectedSession(null); // Reset sessie selectie
      } catch (err) {
        console.error('Error loading group sessions:', err);
        setError('Er is een fout opgetreden bij het laden van de trainingsessies.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGroupSessions();
  }, [selectedGroup]);
  
  // Registreer een oefening als voltooid
  const handleCompleteExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroup || !selectedSession || !selectedExerciseId) {
      setError('Selecteer een groep, sessie en oefening.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
        
      const newCompletedExercise = await exerciseService.completeExercise({
        session_id: selectedSession.id,
        exercise_id: selectedExerciseId,
        sets: setsCount,
        reps: repsCount,
        duration_minutes: duration,
        notes: comments
      });
      
      // Update de lijst van voltooide oefeningen
      setCompletedExercises(prev => [...prev, newCompletedExercise]);
      
      // Verwijder uit openstaande oefeningen
      setPendingExercises(prev => prev.filter(e => e.id !== selectedExerciseId));
      
      // Reset het formulier
      setSelectedExerciseId(null);
      setSetsCount(3);
      setRepsCount(10);
      setDuration(15);
      setComments('');
      
    } catch (err) {
      console.error('Error completing exercise:', err);
      setError('Er is een fout opgetreden bij het registreren van de oefening.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Nieuwe functie voor het maken van een oefening
  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exerciseName || !exerciseCategory || !exerciseInstructions) {
      setError('Vul alle verplichte velden in.');
      return;
    }
    
    try {
      setIsLoading(true);
      const newExercise = await exerciseService.createExercise({
        name: exerciseName,
        description: exerciseDescription,
        category: exerciseCategory,
        difficulty_level: difficultyLevel,
        instructions: exerciseInstructions
      });
      
      // Voeg nieuwe oefening toe aan de lijst
      setExercises([...exercises, newExercise]);
      setPendingExercises([...pendingExercises, newExercise]);
      
      // Reset formulier
      setExerciseName('');
      setExerciseDescription('');
      setExerciseCategory('');
      setDifficultyLevel(1);
      setExerciseInstructions('');
      setShowCreateForm(false);
      
    } catch (err) {
      console.error('Error creating exercise:', err);
      setError('Er is een fout opgetreden bij het aanmaken van de oefening.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verwijder een oefening
  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) throw error;

      toast.success('Oefening succesvol verwijderd');
      // Herlaad exercises
      const fetchedExercises = await exerciseService.getAllExercises();
      setExercises(fetchedExercises);
      setPendingExercises(fetchedExercises);
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast.error('Fout bij verwijderen van oefening');
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
          <h1 className="text-2xl font-bold">Oefeningen Bijhouden</h1>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Oefening
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create Exercise Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nieuwe Oefening Aanmaken</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label htmlFor="exercise-name" className="block text-sm font-medium mb-1">
                  Naam *
                </label>
                <Input
                  id="exercise-name"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="Bijvoorbeeld: Lay-up drill"
                  required
                />
              </div>

              <div>
                <label htmlFor="exercise-category" className="block text-sm font-medium mb-1">
                  Categorie *
                </label>
                <Select value={exerciseCategory} onValueChange={setExerciseCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="exercise-difficulty" className="block text-sm font-medium mb-1">
                  Moeilijkheidsgraad
                </label>
                <Select 
                  value={difficultyLevel.toString()} 
                  onValueChange={(value) => setDifficultyLevel(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map(level => (
                      <SelectItem key={level.value} value={level.value.toString()}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="exercise-description" className="block text-sm font-medium mb-1">
                  Beschrijving
                </label>
                <Textarea
                  id="exercise-description"
                  value={exerciseDescription}
                  onChange={(e) => setExerciseDescription(e.target.value)}
                  placeholder="Korte beschrijving van de oefening..."
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="exercise-instructions" className="block text-sm font-medium mb-1">
                  Instructies *
                </label>
                <Textarea
                  id="exercise-instructions"
                  value={exerciseInstructions}
                  onChange={(e) => setExerciseInstructions(e.target.value)}
                  placeholder="Stap-voor-stap instructies voor de oefening..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Aanmaken...' : 'Oefening Aanmaken'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Annuleren
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">1. Selecteer een groep</h2>
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`p-3 border rounded cursor-pointer ${selectedGroup?.id === group.id ? 'bg-blue-100 border-blue-500' : ''}`}
              >
                <div className="font-medium">{group.name}</div>
                <div className="text-sm text-gray-600">{group.description}</div>
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
                  className={`p-3 border rounded cursor-pointer ${selectedSession?.id === session.id ? 'bg-blue-100 border-blue-500' : ''}`}
                >
                  <div className="font-medium">{session.title || `Sessie ${session.id.substring(0, 8)}`}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(session.date).toLocaleDateString()}
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
        
        <div>
          <h2 className="text-xl font-semibold mb-4">3. Registreer een oefening</h2>
          {selectedGroup && selectedSession ? (
            <form onSubmit={handleCompleteExercise} className="space-y-4">
              <div>
                <label htmlFor="exercise-select" className="block text-sm font-medium mb-1">Oefening</label>
                <select
                  id="exercise-select"
                  value={selectedExerciseId || ''}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full p-2 border rounded"
                  aria-label="Selecteer een oefening om te registreren"
                  required
                >
                  <option value="" disabled>
                    Selecteer een oefening
                  </option>
                  {pendingExercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </div>
                
              <div>
                <label htmlFor="sets-range" className="block text-sm font-medium mb-1">
                  Sets: {setsCount}
                </label>
                <input
                  id="sets-range"
                  type="range"
                  min="1"
                  max="10"
                  value={setsCount}
                  onChange={(e) => setSetsCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="reps-range" className="block text-sm font-medium mb-1">
                  Reps: {repsCount}
                </label>
                <input
                  id="reps-range"
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={repsCount}
                  onChange={(e) => setRepsCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="duration-range" className="block text-sm font-medium mb-1">
                  Duur (minuten): {duration}
                </label>
                <input
                  id="duration-range"
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="comments-textarea" className="block text-sm font-medium mb-1">Opmerkingen</label>
                <textarea
                  id="comments-textarea"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Voeg opmerkingen toe over de oefening..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                disabled={isLoading || !selectedExerciseId}
              >
                {isLoading ? 'Bezig...' : 'Oefening registreren'}
              </button>
            </form>
          ) : (
            <p className="text-gray-500">
              Selecteer eerst een groep en een trainingsessie.
            </p>
          )}
        </div>
      </div>
      
      {selectedGroup && selectedSession && (
        <>
          <h2 className="text-xl font-semibold mb-4">Uitgevoerde oefeningen voor deze sessie</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border text-left">Oefening</th>
                  <th className="py-2 px-4 border text-left">Sets</th>
                  <th className="py-2 px-4 border text-left">Reps</th>
                  <th className="py-2 px-4 border text-left">Duur (min)</th>
                  <th className="py-2 px-4 border text-left">Opmerkingen</th>
                  <th className="py-2 px-4 border text-left">Tijd</th>
                  <th className="py-2 px-4 border text-left">Acties</th>
                </tr>
              </thead>
              <tbody>
                {completedExercises.map((completedExercise) => {
                  const exercise = exercises.find(
                    (e) => e.id === completedExercise.exercise_id
                  );
                  
                  return (
                    <tr key={completedExercise.id}>
                      <td className="py-2 px-4 border">{exercise?.name || 'Onbekende oefening'}</td>
                      <td className="py-2 px-4 border">{completedExercise.sets || '-'}</td>
                      <td className="py-2 px-4 border">{completedExercise.reps || '-'}</td>
                      <td className="py-2 px-4 border">{completedExercise.duration_minutes || '-'}</td>
                      <td className="py-2 px-4 border">
                        {completedExercise.notes || 'Geen opmerkingen'}
                      </td>
                      <td className="py-2 px-4 border">
                        {new Date(completedExercise.completed_at).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-4 border">
                        {/* Fix button accessibility */}
                        {exercise && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExercise(exercise.id)}
                            className="h-6 w-6 p-0"
                            aria-label={`Verwijder oefening ${exercise.name}`}
                            title={`Verwijder oefening ${exercise.name}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                
                {completedExercises.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 px-4 border text-center text-gray-500">
                      Geen uitgevoerde oefeningen voor deze sessie.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Fix undefined exercise issue */}
      {editingExercise && (
        <div>
          <h3>Bewerken: {editingExercise.name}</h3>
          {/* Add null check */}
        </div>
      )}
    </div>
  );
}
