/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { supabase } from './supabaseClient';
import { Exercise as ExerciseType, Attendance } from '@/lib/database-types';

/**
 * Database schema types for trainer management system
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'trainer' | 'member' | 'admin';
  phone?: string;
  emergency_contact?: string;
  medical_info?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at?: string;
}

export interface TrainingGroup {
  id: string;
  name: string;
  description?: string;
  trainer_id: string;
  max_capacity: number;
  current_capacity: number;
  schedule_day: string;
  schedule_time: string;
  location: string;
  status: 'active' | 'inactive' | 'full';
  created_at: string;
  updated_at?: string;
  trainer?: User;
}

export type Exercise = ExerciseType;

export interface TrainingSession {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  group_id: string;
  location_id?: string;
  groups?: {
    id: string;
    name: string;
  };
  locations?: {
    id: string;
    name: string;
    address: string;
  };
  session_trainers?: {
    users: {
      id: string;
      name: string;
    };
  }[];
}

/**
 * Function to fetch a single user by ID
 */
export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data as User;
}

/**
 * Function to fetch all users with optional filtering
 */
export async function getAllUsers(filters: {
  role?: string;
  status?: string;
} = {}) {
  let query = supabase.from('users').select('*');
  
  // Apply filters if provided
  if (filters.role) query = query.eq('role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as User[];
}

/**
 * Function to get all training groups with trainer information
 */
export async function getAllTrainingGroups(filters: {
  trainer_id?: string;
  status?: string;
} = {}) {
  let query = supabase
    .from('groups')
    .select(`
      *,
      creator:users!groups_created_by_fkey (
        id,
        name,
        email
      )
    `);
  
  // Apply filters if provided
  if (filters.trainer_id) {
    query = supabase
      .from('group_trainers')
      .select(`
        groups (
          *,
          creator:users!groups_created_by_fkey (
            id,
            name,
            email
          )
        )
      `)
      .eq('trainer_id', filters.trainer_id);
    
    const { data, error } = await query;
    if (error) throw error;
    return data?.map(item => item.groups).filter(Boolean) as TrainingGroup[];
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as TrainingGroup[];
}

/**
 * Function to get training sessions with pagination
 */
export async function getTrainingSessions(
  groupId?: string,
  limit = 100,
  page = 1,
  startDate?: string,
  endDate?: string
) {
  const offset = (page - 1) * limit;
  
  let query = supabase
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
          name
        )
      )
    `, { count: 'exact' })
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1);
  
  // Apply filters if provided
  if (groupId) query = query.eq('group_id', groupId);
  if (startDate) query = query.gte('start_time', startDate);
  if (endDate) query = query.lte('start_time', endDate);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return {
    data: data as TrainingSession[],
    total: count || 0,
    page,
    limit
  };
}

/**
 * Function to get upcoming sessions for dashboard
 */
export async function getUpcomingSessions(limit = 10) {
  const today = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      groups (
        id,
        name
      ),
      locations (
        name,
        address
      ),
      session_trainers (
        users (
          id,
          name
        )
      )
    `)
    .gte('start_time', today)
    .order('start_time', { ascending: true })
    .limit(limit);
  
  if (error) throw error;
  return data as TrainingSession[];
}

/**
 * Function to record attendance for a session
 */
export async function recordAttendance(
  sessionId: string,
  userId: string,
  status: 'present' | 'absent' | 'late',
  notes?: string
) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert({
      session_id: sessionId,
      user_id: userId,
      status,
      notes,
      check_in_time: status === 'present' ? new Date().toISOString() : null
    })
    .select();
  
  if (error) throw error;
  return data[0] as Attendance;
}

/**
 * Function to get attendance for a session
 */
export async function getSessionAttendance(sessionId: string) {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      user:users (
        id,
        name,
        email
      )
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data as Attendance[];
}

/**
 * Function to subscribe to training session updates
 */
export function subscribeToSessionUpdates(
  groupId: string,
  callback: (session: TrainingSession) => void
) {
  const subscription = supabase
    .channel(`group-${groupId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `group_id=eq.${groupId}`
      },
      (payload) => {
        callback(payload.new as TrainingSession);
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
}
