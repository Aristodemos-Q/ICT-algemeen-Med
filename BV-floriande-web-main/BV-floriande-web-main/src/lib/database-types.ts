/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Database Types for Medical Practice Management System
 * Transformed from BV Floriande to support medical appointments and patient management
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'assistant';
  specialization?: string;
  license_number?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface Patient {
  id: string;
  patient_number: string;
  name: string;
  birth_date: string;
  gender?: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  insurance_company?: string;
  insurance_number?: string;
  gp_patient: boolean;
  medical_notes?: string;
  allergies?: string;
  medications?: string;
  created_at: string;
  updated_at?: string;
}

export interface PracticeLocation {
  id: string;
  name: string;
  address: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  email?: string;
  opening_hours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  facilities?: string[];
  is_main_location: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price?: number;
  requires_doctor: boolean;
  color_code: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id?: string;
  appointment_type_id?: string;
  location_id?: string;
  scheduled_at: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  chief_complaint?: string;
  notes?: string;
  diagnosis?: string;
  treatment_plan?: string;
  follow_up_needed: boolean;
  follow_up_date?: string;
  created_by?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at?: string;
  // Relations
  patient?: Patient;
  doctor?: User;
  appointment_type?: AppointmentType;
  location?: PracticeLocation;
}

export interface AppointmentRequest {
  id: string;
  patient_id?: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  patient_birth_date?: string;
  appointment_type_id?: string;
  preferred_date?: string;
  preferred_time?: string;
  alternative_dates?: string[];
  chief_complaint: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'scheduled' | 'rejected';
  rejection_reason?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at?: string;
  // Relations
  patient?: Patient;
  appointment_type?: AppointmentType;
  processed_by_user?: User;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  appointment_id?: string;
  doctor_id: string;
  record_type: 'consultation' | 'prescription' | 'referral' | 'test_result' | 'diagnosis';
  title: string;
  content: string;
  confidential: boolean;
  attachments?: string[];
  tags?: string[];
  created_at: string;
  updated_at?: string;
  // Relations
  patient?: Patient;
  doctor?: User;
  appointment?: Appointment;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  pharmacy?: string;
  status: 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
  // Relations
  patient?: Patient;
  doctor?: User;
  appointment?: Appointment;
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  location_id: string;
  day_of_week: number; // 1=Monday, 7=Sunday
  start_time: string;
  end_time: string;
  is_active: boolean;
  break_start?: string;
  break_end?: string;
  max_appointments_per_hour: number;
  created_at: string;
  updated_at?: string;
  // Relations
  doctor?: User;
  location?: PracticeLocation;
}

// Form types for appointment booking
export interface AppointmentBookingForm {
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  patient_birth_date?: string;
  appointment_type_id: string;
  preferred_date: string;
  preferred_time?: string;
  alternative_dates?: string[];
  chief_complaint: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
}

// Dashboard statistics
export interface DashboardStats {
  total_patients: number;
  total_appointments_today: number;
  pending_requests: number;
  completed_appointments_this_week: number;
  upcoming_appointments: Appointment[];
  recent_patients: Patient[];
}

// Calendar event (for appointment display)
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor?: string;
  borderColor?: string;
  appointment?: Appointment;
  patient?: Patient;
  doctor?: User;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Search and filter types
export interface AppointmentFilters {
  date_from?: string;
  date_to?: string;
  doctor_id?: string;
  patient_id?: string;
  status?: string;
  appointment_type_id?: string;
}

export interface PatientFilters {
  search?: string;
  gp_patient?: boolean;
  insurance_company?: string;
}

// Email templates data
export interface AppointmentConfirmationEmail {
  patient_name: string;
  patient_email: string;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  location_name: string;
  location_address: string;
  appointment_type: string;
  instructions?: string;
}

export interface AppointmentReminderEmail {
  patient_name: string;
  patient_email: string;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  location_name: string;
  location_address: string;
  appointment_type: string;
  phone_number: string;
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
