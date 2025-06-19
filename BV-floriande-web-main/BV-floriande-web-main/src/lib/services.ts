/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { supabase } from './supabaseClient';
import type {
  User as DbUser,
  Group,
  Member,
  Location,
  Session,
  Exercise as DbExercise,
  Attendance as DbAttendance,
  CompletedExercise
} from './database-types';

// Define types for our trainer management data models that extend database types
export interface TrainingGroup extends Group {
  trainer_id?: string;
  max_participants?: number;
  trainer?: DbUser;
}

export interface TrainingSession extends Session {
  trainer_id?: string;
  status?: string;
}

// Add missing Attendance type definition
export interface Attendance {
  id: string;
  session_id: string;
  user_id: string;
  status: 'present' | 'absent' | 'late';
  created_at: string;
  updated_at: string;
}

// Base service class for common database operations
export class BaseService<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create(item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([item])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

// Create service classes using the BaseService
export class UserService extends BaseService<DbUser> {
  constructor() {
    super('users');
  }

  async getByRole(role: string): Promise<DbUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role);
    
    if (error) throw error;
    return data || [];
  }
}

export class TrainingGroupService extends BaseService<TrainingGroup> {
  constructor() {
    super('groups');
  }

  async getByTrainer(trainerId: string): Promise<TrainingGroup[]> {
    try {
      const { data, error } = await supabase
        .from('group_trainers')
        .select(`
          groups (*)
        `)
        .eq('trainer_id', trainerId);
      
      if (error) {
        console.error('Error fetching trainer groups:', error);
        return []; // Return empty array instead of throwing
      }
      return (data?.map(item => item.groups).filter(Boolean) as unknown as TrainingGroup[]) || [];
    } catch (error) {
      console.error('Error in getByTrainer:', error);
      return []; // Return empty array on any error
    }
  }
}

export class ExerciseService extends BaseService<DbExercise> {
  constructor() {
    super('exercises');
  }

  async getByCategory(category: string): Promise<DbExercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('category', category);
    
    if (error) throw error;
    return data || [];
  }

  async completeExercise(completedExercise: {
    session_id: string;
    exercise_id: string;
    sets?: number;
    reps?: number;
    duration_minutes?: number;
    notes?: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('completed_exercises')
      .insert([{
        ...completedExercise,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteExercise(id: string): Promise<void> {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

export class TrainingSessionService extends BaseService<TrainingSession> {
  constructor() {
    super('sessions');
  }

  async getByGroup(groupId: string): Promise<TrainingSession[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('group_id', groupId)
      .order('start_time', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getUpcoming(limit: number = 10): Promise<TrainingSession[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  async createSessionWithTrainers(sessionData: Omit<TrainingSession, 'id' | 'created_at' | 'updated_at'>, trainerIds: string[]): Promise<TrainingSession> {
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Voeg trainers toe aan de sessie
    if (trainerIds.length > 0) {
      const sessionTrainers = trainerIds.map(trainerId => ({
        session_id: session.id,
        user_id: trainerId
      }));

      const { error: trainersError } = await supabase
        .from('session_trainers')
        .insert(sessionTrainers);

      if (trainersError) throw trainersError;
    }

    return session;
  }

  async getSessionsWithTrainers(): Promise<any[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        groups (
          id,
          name
        ),
        locations (
          id,
          name,
          address
        ),
        session_trainers (
          users (
            id,
            name,
            email
          )
        )
      `)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updateSessionTrainers(sessionId: string, trainerIds: string[]): Promise<void> {
    // Verwijder bestaande trainer-sessie koppelingen
    const { error: deleteError } = await supabase
      .from('session_trainers')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) throw deleteError;

    // Voeg nieuwe trainer-sessie koppelingen toe
    if (trainerIds.length > 0) {
      const sessionTrainers = trainerIds.map(trainerId => ({
        session_id: sessionId,
        user_id: trainerId
      }));

      const { error: insertError } = await supabase
        .from('session_trainers')
        .insert(sessionTrainers);

      if (insertError) throw insertError;
    }
  }
}

export class AttendanceService extends BaseService<DbAttendance> {
  constructor() {
    super('attendance');
  }

  async getBySession(sessionId: string): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('session_id', sessionId);
    
    if (error) throw error;
    return data || [];
  }

  async recordBulkAttendance(
    sessionId: string,
    records: Array<{
      memberId: string;
      status: 'present' | 'absent' | 'late';
      note?: string;
    }>,
    recordedBy: string
  ): Promise<void> {
    const attendanceRecords = records.map(record => ({
      session_id: sessionId,
      participant_id: record.memberId,
      status: record.status,
      notes: record.note || '',
      recorded_by: recordedBy
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(attendanceRecords, {
        onConflict: 'session_id,participant_id'
      });
    
    if (error) throw error;
  }
}

export const userService = new UserService();
export const trainingGroupService = new TrainingGroupService();
export const exerciseService = new ExerciseService();
export const trainingSessionService = new TrainingSessionService();
export const attendanceService = new AttendanceService();
