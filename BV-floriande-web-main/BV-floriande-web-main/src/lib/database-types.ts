/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

// Definitie van alle database types voor BV Floriande trainerssysteem

export type UserRole = 'admin' | 'trainer';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'trainer' | 'admin';
  created_at: string;
  updated_at?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  level?: string;
  age_category?: string;
  max_members?: number;
  created_by: string;
  created_at: string;
  updated_at?: string;
  group_trainers?: GroupTrainer[];
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  date_of_birth?: string; // Alias for birth_date for backward compatibility
  contact_info?: string;
  emergency_contact?: string;
  medical_info?: string;
  created_at: string;
  updated_at?: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface Session {
  id: string;
  title?: string;
  description?: string;
  group_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  location_id?: string;
  duration?: number;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recurrence_end_date?: string;
  parent_session_id?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty_level: number;
  instructions?: string;
  equipment_needed?: string;
  created_at: string;
  updated_at?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  member_id: string;
  created_at: string;
  member?: Member;
  group?: Group;
}

export interface GroupTrainer {
  id: string;
  group_id: string;
  trainer_id: string;
  assigned_at: string;
  assigned_by?: string;
  trainer?: User;
  group?: Group;
  assigned_by_user?: User;
}

export interface SessionTrainer {
  id: string;
  session_id: string;
  trainer_id: string;
  created_at: string;
  trainer?: Member;
  session?: Session;
}

export interface Attendance {
  id: string;
  session_id: string;
  member_id: string;
  present: boolean;
  created_at: string;
  updated_at: string;
  member?: Member;
  session?: Session;
}

export interface CompletedExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  group_id?: string;
  sets?: number;
  reps?: number;
  duration_minutes?: number;
  difficulty_rating?: number;
  notes?: string;
  completed_at: string;
  created_at: string;
  updated_at?: string;
}

export interface GroupEvaluation {
  id: string;
  group_id: string;
  evaluation_date: string;
  strengths?: string;
  areas_for_improvement?: string;
  recommended_exercises?: string[];
  next_goals?: string;
  notes?: string;
  evaluator_id: string;
  created_at: string;
  updated_at?: string;
}

// View types
export interface GroupPendingExercise {
  group_id: string;
  group_name: string;
  exercise_id: string;
  exercise_name: string;
}

export interface GroupDifficultySummary {
  group_id: string;
  group_name: string;
  exercise_id: string;
  exercise_name: string;
  avg_difficulty: number;
  times_completed: number;
}

// Recommended exercises type (voor de AI-functionaliteit)
export interface RecommendedExercise {
  exercise_id: string;
  exercise_name: string;
  similarity_score: number;
}

// Database type definities voor Supabase
export type Tables = {
  users: User;
  groups: Group;
  members: Member;
  group_members: GroupMember;
  locations: Location;
  exercises: Exercise;
  sessions: Session;
  session_trainers: SessionTrainer;
  attendance: Attendance;
  completed_exercises: CompletedExercise;
  group_evaluations: GroupEvaluation;
};

export type Views = {
  group_pending_exercises: GroupPendingExercise;
  group_difficulty_summary: GroupDifficultySummary;
};

export type Functions = {
  get_recommended_exercises: RecommendedExercise;
};

export type DbSchema = {
  tables: Tables;
  views: Views;
  functions: Functions;
};

export type Database = DbSchema;
