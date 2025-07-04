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
  status?: Appointment['status'];
  appointment_type_id?: string;
  location_id?: string;
}

export interface PatientFilters {
  search?: string;
  gp_patient?: boolean;
  insurance_company?: string;
  gender?: 'male' | 'female' | 'other';
  age_min?: number;
  age_max?: number;
}

export interface MedicalRecordFilters {
  patient_id?: string;
  doctor_id?: string;
  record_type?: MedicalRecord['record_type'];
  date_from?: string;
  date_to?: string;
  confidential?: boolean;
}

// Email notification types
export interface EmailNotification {
  to: string;
  subject: string;
  template: 'appointment_confirmation' | 'appointment_reminder' | 'staff_notification';
  data: {
    patient_name?: string;
    appointment_date?: string;
    appointment_time?: string;
    doctor_name?: string;
    location_name?: string;
    [key: string]: any;
  };
}

// Time slot availability
export interface TimeSlot {
  time: string;
  available: boolean;
  doctor_id?: string;
  doctor_name?: string;
  appointment_type_id?: string;
}

export interface AvailabilityRequest {
  date: string;
  appointment_type_id: string;
  doctor_id?: string;
  location_id?: string;
}

// Appointment scheduling
export interface CreateAppointmentRequest {
  patient_id: string;
  doctor_id?: string;
  appointment_type_id: string;
  location_id?: string;
  scheduled_at: string;
  chief_complaint?: string;
  notes?: string;
}

// Dashboard widgets
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  requiresAuth: boolean;
  roles?: User['role'][];
}

// Notification system
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
}

// Process automation tracking
export interface AutomationLog {
  id: string;
  process_type: 'appointment_request' | 'email_notification' | 'reminder' | 'follow_up';
  entity_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// Database operation result
export interface DatabaseOperation<T> {
  success: boolean;
  data?: T;
  error?: string;
  operation: 'create' | 'read' | 'update' | 'delete';
  table: string;
  timestamp: string;
}

// Legacy types for backward compatibility (will be removed)
export type { User as BvfUser, Patient as Member };
