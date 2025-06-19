/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Medical Practice Queries - Database operations for medical practice management
 * Handles patients, appointments, medical records, and practice administration
 */

import { supabase } from './supabaseClient';
import { 
  User, 
  Patient, 
  Appointment, 
  AppointmentRequest, 
  AppointmentType, 
  PracticeLocation,
  MedicalRecord,
  Prescription,
  DoctorSchedule,
  DashboardStats,
  AppointmentFilters,
  PatientFilters
} from './medcheck-types';

// Error handling helper
function handleError(error: any, context: string) {
  console.error(`${context}:`, error);
  throw error;
}

/**
 * USER MANAGEMENT QUERIES
 */
export const userQueries = {
  /**
   * Get current logged in user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      handleError(error, 'Error getting current user');
      return null;
    }
    
    if (!user) return null;
    
    const { data, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      handleError(profileError, 'Error getting user profile');
      return null;
    }
    
    return data;
  },
  
  /**
   * Check if current user is admin
   */
  async isAdmin() {
    const user = await this.getCurrentUser();
    return user?.role === 'admin';
  },
  
  /**
   * Check if current user is doctor
   */
  async isDoctor() {
    const user = await this.getCurrentUser();
    return user?.role === 'doctor';
  },
  
  /**
   * Get all users with optional role filter
   */
  async getAllUsers(role?: string) {
    let query = supabase.from('users').select('*');
    
    if (role) {
      query = query.eq('role', role);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      handleError(error, 'Error getting users');
    }
    
    return data || [];
  },
  
  /**
   * Get all doctors
   */
  async getDoctors() {
    return this.getAllUsers('doctor');
  }
};

/**
 * PATIENT MANAGEMENT QUERIES
 */
export const patientQueries = {
  /**
   * Get all patients with optional filters
   */
  async getAllPatients(filters: PatientFilters = {}) {
    let query = supabase.from('patients').select('*');
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,patient_number.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    
    if (filters.gp_patient !== undefined) {
      query = query.eq('gp_patient', filters.gp_patient);
    }
    
    if (filters.insurance_company) {
      query = query.eq('insurance_company', filters.insurance_company);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      handleError(error, 'Error getting patients');
    }
    
    return data || [];
  },
  
  /**
   * Get patient by ID
   */
  async getPatientById(id: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      handleError(error, 'Error getting patient');
    }
    
    return data;
  },
  
  /**
   * Create new patient
   */
  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('patients')
      .insert([patient])
      .select()
      .single();
    
    if (error) {
      handleError(error, 'Error creating patient');
    }
    
    return data;
  },
  
  /**
   * Update patient
   */
  async updatePatient(id: string, updates: Partial<Patient>) {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      handleError(error, 'Error updating patient');
    }
    
    return data;
  },
  
  /**
   * Get recent patients (for dashboard)
   */
  async getRecentPatients(limit = 10) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      handleError(error, 'Error getting recent patients');
    }
    
    return data || [];
  }
};

/**
 * APPOINTMENT MANAGEMENT QUERIES
 */
export const appointmentQueries = {
  /**
   * Get all appointments with optional filters
   */
  async getAllAppointments(filters: AppointmentFilters = {}) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:users(*),
        appointment_type:appointment_types(*),
        location:practice_locations(*)
      `);
    
    if (filters.date_from) {
      query = query.gte('scheduled_at', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('scheduled_at', filters.date_to);
    }
    
    if (filters.doctor_id) {
      query = query.eq('doctor_id', filters.doctor_id);
    }
    
    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.appointment_type_id) {
      query = query.eq('appointment_type_id', filters.appointment_type_id);
    }
    
    const { data, error } = await query.order('scheduled_at');
    
    if (error) {
      handleError(error, 'Error getting appointments');
    }
    
    return data || [];
  },
  
  /**
   * Get appointments for today
   */
  async getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.getAllAppointments({
      date_from: today,
      date_to: tomorrow
    });
  },
  
  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(limit = 10) {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:users(*),
        appointment_type:appointment_types(*),
        location:practice_locations(*)
      `)
      .gte('scheduled_at', now)
      .order('scheduled_at')
      .limit(limit);
    
    if (error) {
      handleError(error, 'Error getting upcoming appointments');
    }
    
    return data || [];
  },
  
  /**
   * Create new appointment
   */
  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select(`
        *,
        patient:patients(*),
        doctor:users(*),
        appointment_type:appointment_types(*),
        location:practice_locations(*)
      `)
      .single();
    
    if (error) {
      handleError(error, 'Error creating appointment');
    }
    
    return data;
  },
  
  /**
   * Update appointment
   */
  async updateAppointment(id: string, updates: Partial<Appointment>) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        patient:patients(*),
        doctor:users(*),
        appointment_type:appointment_types(*),
        location:practice_locations(*)
      `)
      .single();
    
    if (error) {
      handleError(error, 'Error updating appointment');
    }
    
    return data;
  }
};

/**
 * APPOINTMENT REQUEST MANAGEMENT
 */
export const appointmentRequestQueries = {
  /**
   * Get all appointment requests
   */
  async getAllRequests(status?: string) {
    let query = supabase
      .from('appointment_requests')
      .select(`
        *,
        patient:patients(*),
        appointment_type:appointment_types(*),
        processed_by_user:users(*)
      `);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      handleError(error, 'Error getting appointment requests');
    }
    
    return data || [];
  },
  
  /**
   * Get pending appointment requests
   */
  async getPendingRequests() {
    return this.getAllRequests('pending');
  },
  
  /**
   * Create appointment request (public endpoint)
   */
  async createAppointmentRequest(request: Omit<AppointmentRequest, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const { data, error } = await supabase
      .from('appointment_requests')
      .insert([{ ...request, status: 'pending' }])
      .select()
      .single();
    
    if (error) {
      handleError(error, 'Error creating appointment request');
    }
    
    return data;
  },
  
  /**
   * Process appointment request (approve/reject)
   */
  async processAppointmentRequest(id: string, status: 'approved' | 'rejected' | 'scheduled', processedBy: string, rejectionReason?: string) {
    const { data, error } = await supabase
      .from('appointment_requests')
      .update({
        status,
        processed_by: processedBy,
        processed_at: new Date().toISOString(),
        rejection_reason: rejectionReason || null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      handleError(error, 'Error processing appointment request');
    }
    
    return data;
  }
};

/**
 * APPOINTMENT TYPES MANAGEMENT
 */
export const appointmentTypeQueries = {
  /**
   * Get all appointment types
   */
  async getAllAppointmentTypes(activeOnly = false) {
    let query = supabase.from('appointment_types').select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      handleError(error, 'Error getting appointment types');
    }
    
    return data || [];
  },
  
  /**
   * Get active appointment types for public booking
   */
  async getActiveAppointmentTypes() {
    return this.getAllAppointmentTypes(true);
  }
};

/**
 * PRACTICE LOCATIONS MANAGEMENT
 */
export const locationQueries = {
  /**
   * Get all practice locations
   */
  async getAllLocations() {
    const { data, error } = await supabase
      .from('practice_locations')
      .select('*')
      .order('name');
    
    if (error) {
      handleError(error, 'Error getting practice locations');
    }
    
    return data || [];
  },
  
  /**
   * Get main practice location
   */
  async getMainLocation() {
    const { data, error } = await supabase
      .from('practice_locations')
      .select('*')
      .eq('is_main_location', true)
      .single();
    
    if (error) {
      // If no main location, get first location
      const locations = await this.getAllLocations();
      return locations[0] || null;
    }
    
    return data;
  }
};

/**
 * DASHBOARD STATISTICS
 */
export const dashboardQueries = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get total patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      // Get today's appointments
      const todayAppointments = await appointmentQueries.getTodayAppointments();
      
      // Get pending requests
      const pendingRequests = await appointmentRequestQueries.getPendingRequests();
      
      // Get this week's completed appointments
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const completedThisWeek = await appointmentQueries.getAllAppointments({
        date_from: weekStart.toISOString(),
        date_to: weekEnd.toISOString(),
        status: 'completed'
      });
      
      // Get upcoming appointments
      const upcomingAppointments = await appointmentQueries.getUpcomingAppointments(5);
      
      // Get recent patients
      const recentPatients = await patientQueries.getRecentPatients(5);
      
      return {
        total_patients: totalPatients || 0,
        total_appointments_today: todayAppointments.length,
        pending_requests: pendingRequests.length,
        completed_appointments_this_week: completedThisWeek.length,
        upcoming_appointments: upcomingAppointments,
        recent_patients: recentPatients
      };
    } catch (error) {
      handleError(error, 'Error getting dashboard stats');
      return {
        total_patients: 0,
        total_appointments_today: 0,
        pending_requests: 0,
        completed_appointments_this_week: 0,
        upcoming_appointments: [],
        recent_patients: []
      };
    }
  }
};

// Export all query modules
export const medicalQueries = {
  users: userQueries,
  patients: patientQueries,
  appointments: appointmentQueries,
  appointmentRequests: appointmentRequestQueries,
  appointmentTypes: appointmentTypeQueries,
  locations: locationQueries,
  dashboard: dashboardQueries
};

export default medicalQueries;
