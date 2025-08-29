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
  PatientFilters,
  MedicalRecordFilters,
  AppointmentBookingForm,
  TimeSlot,
  AvailabilityRequest,
  CreateAppointmentRequest,
  EmailNotification,
  AutomationLog,
  DatabaseOperation
} from './medcheck-types';

// Enhanced error handling helper with detailed logging
function handleError(error: any, context: string) {
  // Log all available error information
  console.error(`${context}:`, {
    error,
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    status: error?.status,
    statusText: error?.statusText,
    stack: error?.stack,
    // Try to extract any hidden properties
    ...error
  });
  
  // Also log the error as a string to see if there's hidden info
  console.error('Error as string:', String(error));
  console.error('Error keys:', Object.keys(error || {}));
  
  // Create a more informative error message
  let errorMessage = 'Unknown error occurred';
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (error?.details) {
    errorMessage = error.details;
  } else if (error?.code) {
    errorMessage = `Error code: ${error.code}`;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  const newError = new Error(`${context}: ${errorMessage}`);
  if (error?.stack) {
    newError.stack = error.stack;
  }
  throw newError;
}

// Debug function to test Supabase connection
async function debugSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('appointment_types')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful:', data);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection exception:', error);
    return false;
  }
}

/**
 * USER MANAGEMENT QUERIES
 */
const userQueries = {
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
   * Get all doctors
   */
  async getAllDoctors(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'doctor')
      .order('name');
    
    if (error) {
      handleError(error, 'Error fetching doctors');
      return [];
    }
    
    return data || [];
  }
};

/**
 * PATIENT MANAGEMENT QUERIES
 */
const patientQueries = {
  /**
   * Get all patients with filtering and pagination
   */
  async getAllPatients(filters: PatientFilters = {}, limit = 50, offset = 0): Promise<Patient[]> {
    let query = supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,patient_number.ilike.%${filters.search}%`);
    }
    
    if (filters.gp_patient !== undefined) {
      query = query.eq('gp_patient', filters.gp_patient);
    }
    
    if (filters.insurance_company) {
      query = query.eq('insurance_company', filters.insurance_company);
    }
    
    const { data, error } = await query;
    
    if (error) {
      handleError(error, 'Error fetching patients');
      return [];
    }
    
    return data || [];
  },

  /**
   * Get patient by ID
   */
  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      handleError(error, `Error fetching patient ${id}`);
      return null;
    }
    
    return data;
  },

  /**
   * Create new patient
   */
  async createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'patient_number'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();
    
    if (error) {
      handleError(error, 'Error creating patient');
      throw error;
    }
    
    return data;
  },

  /**
   * Update patient
   */
  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      handleError(error, `Error updating patient ${id}`);
      throw error;
    }
    
    return data;
  },

  /**
   * Get recent patients (last 10)
   */
  async getRecentPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      handleError(error, 'Error fetching recent patients');
      return [];
    }
    
    return data || [];
  }
};

/**
 * APPOINTMENT MANAGEMENT QUERIES
 */
const appointmentQueries = {
  /**
   * Get appointments with filters - includes both database and offline appointments
   */
  async getAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
    const appointments: Appointment[] = [];
    
    try {
      // Try to fetch from database first
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:users!appointments_doctor_id_fkey(*),
          appointment_type:appointment_types(*),
          location:practice_locations(*)
        `)
        .order('scheduled_at', { ascending: true });
      
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
      
      const { data, error } = await query;
      
      if (data && !error) {
        appointments.push(...data);
        console.log(`✅ Fetched ${data.length} appointments from database`);
      } else if (error) {
        console.warn('⚠️ Database query failed, using offline mode:', error.message);
      }
    } catch (error) {
      console.warn('⚠️ Database connection failed, using offline mode:', error);
    }
    
    // Always check localStorage for offline appointment requests
    try {
      const storedRequests = localStorage.getItem('offline_appointment_requests');
      if (storedRequests) {
        const requests: AppointmentRequest[] = JSON.parse(storedRequests);
        console.log(`📱 Found ${requests.length} offline appointment requests`);
        
        // Convert appointment requests to appointment format
        const offlineAppointments: Appointment[] = requests.map(request => ({
          id: `offline_${request.id}`,
          patient_id: request.patient_id || `temp_${Date.now()}`,
          doctor_id: undefined, // Not set in appointment requests
          appointment_type_id: request.appointment_type_id || '',
          location_id: '1', // Fixed to main location
          scheduled_at: request.preferred_date || new Date().toISOString(),
          end_time: new Date(new Date(request.preferred_date || new Date()).getTime() + 30 * 60000).toISOString(), // Add 30 minutes
          status: 'scheduled' as const,
          chief_complaint: request.chief_complaint,
          notes: `Offline appointment request - Urgency: ${request.urgency}`,
          follow_up_needed: false,
          created_at: request.created_at,
          updated_at: request.updated_at || request.created_at,
          // Add related data using basic info from the request
          patient: {
            id: request.patient_id || `temp_${Date.now()}`,
            patient_number: 'TEMP001',
            name: request.patient_name,
            birth_date: request.patient_birth_date || '',
            gender: 'other' as const,
            email: request.patient_email,
            phone: request.patient_phone || '',
            address: '',
            postal_code: '',
            city: '',
            emergency_contact: '',
            emergency_phone: '',
            insurance_company: '',
            insurance_number: '',
            gp_patient: false,
            medical_notes: '',
            allergies: '',
            medications: '',
            created_at: request.created_at,
            updated_at: request.created_at
          },
          doctor: undefined, // We don't have doctor details offline
          appointment_type: {
            id: request.appointment_type_id || 'general',
            name: appointmentRequestQueries.getAppointmentTypeName(request.appointment_type_id || 'general'),
            description: '',
            duration_minutes: 30,
            requires_doctor: true,
            color_code: '#3B82F6',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          location: {
            id: '1',
            name: 'Spaarnepoort 1',
            address: 'Spaarnepoort 1',
            city: 'Hoofddorp',
            postal_code: '2134 TM',
            country: 'Nederland',
            phone: '+31 23 554 0100',
            email: 'info@bv-floriande.nl',
            is_main_location: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }));
        
        // Filter offline appointments based on the same filters
        let filteredOfflineAppointments = offlineAppointments;
        
        if (filters.date_from) {
          filteredOfflineAppointments = filteredOfflineAppointments.filter(
            apt => new Date(apt.scheduled_at) >= new Date(filters.date_from!)
          );
        }
        
        if (filters.date_to) {
          filteredOfflineAppointments = filteredOfflineAppointments.filter(
            apt => new Date(apt.scheduled_at) <= new Date(filters.date_to!)
          );
        }
        
        if (filters.status) {
          filteredOfflineAppointments = filteredOfflineAppointments.filter(
            apt => apt.status === filters.status
          );
        }
        
        appointments.push(...filteredOfflineAppointments);
        console.log(`📱 Added ${filteredOfflineAppointments.length} offline appointments`);
      }
    } catch (error) {
      console.error('❌ Error reading offline appointments:', error);
    }
    
    // Sort all appointments by scheduled date
    appointments.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    
    console.log(`📋 Total appointments found: ${appointments.length} (${appointments.filter(a => a.id.startsWith('offline_')).length} offline)`);
    return appointments;
  },

  /**
   * Get today's appointments
   */
  async getTodaysAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments({
      date_from: today + 'T00:00:00',
      date_to: today + 'T23:59:59'
    });
  },

  /**
   * Get upcoming appointments (next 7 days)
   */
  async getUpcomingAppointments(): Promise<Appointment[]> {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.getAppointments({
      date_from: today.toISOString(),
      date_to: nextWeek.toISOString()
    });
  },

  /**
   * Create new appointment (automatically uses fixed location)
   */
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    // Automatically set the fixed location if not provided
    const appointmentWithLocation = {
      ...appointmentData,
      location_id: appointmentData.location_id || 'fixed-location-spaarnepoort'
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentWithLocation])
      .select(`
        *,
        patient:patients(*),
        doctor:users!appointments_doctor_id_fkey(*),
        appointment_type:appointment_types(*)
      `)
      .single();
    
    if (error) {
      handleError(error, 'Error creating appointment');
      throw error;
    }
    
    // Add the fixed location data to the response
    const result = {
      ...data,
      location: {
        id: 'fixed-location-spaarnepoort',
        name: 'BV Floriande - Spaarnepoort',
        address: 'Spaarnepoort 1',
        postal_code: '2134 TM',
        city: 'Hoofddorp',
        phone: '023-5630350',
        email: 'info@bvfloriande.nl',
        is_main_location: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    return result;
  },

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        patient:patients(*),
        doctor:users!appointments_doctor_id_fkey(*),
        appointment_type:appointment_types(*),
        location:practice_locations(*)
      `)
      .single();
    
    if (error) {
      handleError(error, `Error updating appointment ${id}`);
      throw error;
    }
    
    return data;
  },

  /**
   * Get appointments by patient email
   */
  async getByPatientEmail(email: string): Promise<Appointment[]> {
    try {
      console.log('🔍 Starting getByPatientEmail query for:', email);
      
      // First test basic Supabase connection
      await debugSupabaseConnection();
      
      // Try with patient_email column first (more efficient)
      console.log('🔄 Attempting direct patient_email query...');
      const { data: directData, error: directError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:users!appointments_doctor_id_fkey(*),
          appointment_type:appointment_types(*),
          location:practice_locations(*)
        `)
        .eq('patient_email', email)
        .order('scheduled_at', { ascending: false });
      
      // If direct query works, return the data
      if (!directError && directData) {
        console.log('✅ Direct patient_email query successful:', directData.length, 'appointments');
        return directData;
      }
      
      if (directError) {
        console.log('⚠️ Direct patient_email query failed:', directError);
      }
      
      // If patient_email column doesn't work, try to find patient first then appointments
      console.log('🔄 Trying patient lookup approach...');
      
      // First, find the patient by email
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('email', email)
        .single();
      
      if (patientError || !patientData) {
        console.log('ℹ️ No patient found with email:', email, 'Error:', patientError);
        return [];
      }
      
      console.log('✅ Found patient:', patientData.id);
      
      // Then get appointments for that patient
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:users!appointments_doctor_id_fkey(*),
          appointment_type:appointment_types(*),
          location:practice_locations(*)
        `)
        .eq('patient_id', patientData.id)
        .order('scheduled_at', { ascending: false });
      
      if (appointmentError) {
        console.error('❌ Appointment query failed:', appointmentError);
        handleError(appointmentError, `Error fetching appointments for patient ${email}`);
        return [];
      }
      
      console.log('✅ Patient lookup approach successful:', appointmentData?.length || 0, 'appointments');
      return appointmentData || [];
      
    } catch (error) {
      console.error('❌ Exception in getByPatientEmail:', error);
      handleError(error, `Error fetching appointments for patient ${email}`);
      return [];
    }
  }
};

/**
 * APPOINTMENT REQUEST MANAGEMENT QUERIES
 */
const appointmentRequestQueries = {
  /**
   * Get all appointment requests
   */
  async getAllRequests(): Promise<AppointmentRequest[]> {
    try {
      console.log('🔍 Starting getAllRequests query...');
      
      // First test if table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('appointment_requests')
        .select('count')
        .limit(1);
        
      console.log('📊 Table check result:', { tableCheck, tableError });
      
      if (tableError) {
        console.error('❌ Table check failed:', tableError);
        if (tableError.message?.includes('relation') && tableError.message?.includes('does not exist')) {
          throw new Error('Table "appointment_requests" does not exist in Supabase. Please run the setup SQL first.');
        }
        throw tableError;
      }
      
      const { data, error } = await supabase
        .from('appointment_requests')
        .select(`
          *,
          appointment_type:appointment_types(*),
          processed_by_user:users(*)
        `)
        .order('created_at', { ascending: false });
      
      console.log('📄 Query result:', { data: data?.length || 0, error });
      
      if (error) {
        console.error('❌ Supabase query error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        handleError(error, 'Error fetching appointment requests');
        return [];
      }
      
      console.log('✅ Successfully fetched appointment requests:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ getAllRequests failed with error:', error);
      return [];
    }
  },

  /**
   * Get pending appointment requests (includes offline requests)
   */
  async getPendingRequests(): Promise<AppointmentRequest[]> {
    let databaseRequests: AppointmentRequest[] = [];
    
    // Try to get from database first
    try {
      const { data, error } = await supabase
        .from('appointment_requests')
        .select(`
          *,
          appointment_type:appointment_types(*)
        `)
        .eq('status', 'pending')
        .order('urgency', { ascending: false })
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        databaseRequests = data;
      }
    } catch (dbError) {
      console.log('Database fetch failed, using offline mode:', dbError);
    }
    
    // Get offline requests from localStorage
    let offlineRequests: AppointmentRequest[] = [];
    try {
      const storedRequests = localStorage.getItem('offline_appointment_requests');
      if (storedRequests) {
        offlineRequests = JSON.parse(storedRequests);
      }
    } catch (storageError) {
      console.error('Failed to read from localStorage:', storageError);
    }
    
    // Combine both sources
    return [...databaseRequests, ...offlineRequests];
  },

  /**
   * Create new appointment request (offline mode - saves to localStorage)
   */
  async createRequest(requestData: AppointmentBookingForm): Promise<AppointmentRequest> {
    try {
      // First try database save (if Supabase is configured)
      const { data, error } = await supabase
        .from('appointment_requests')
        .insert([{
          patient_name: requestData.patient_name,
          patient_email: requestData.patient_email,
          patient_phone: requestData.patient_phone,
          patient_birth_date: requestData.patient_birth_date,
          appointment_type_id: requestData.appointment_type_id,
          preferred_date: requestData.preferred_date,
          preferred_time: requestData.preferred_time,
          alternative_dates: requestData.alternative_dates,
          chief_complaint: requestData.chief_complaint,
          urgency: requestData.urgency,
          status: 'pending'
        }])
        .select(`
          *,
          appointment_type:appointment_types(*)
        `)
        .single();
      
      if (!error && data) {
        return data;
      }
    } catch (dbError) {
      console.log('Database save failed, using offline mode:', dbError);
    }
    
    // Fallback: Create appointment request offline and save to localStorage
    const appointmentRequest: AppointmentRequest = {
      id: `offline-request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patient_name: requestData.patient_name,
      patient_email: requestData.patient_email,
      patient_phone: requestData.patient_phone,
      patient_birth_date: requestData.patient_birth_date,
      appointment_type_id: requestData.appointment_type_id,
      preferred_date: requestData.preferred_date,
      preferred_time: requestData.preferred_time,
      alternative_dates: requestData.alternative_dates,
      chief_complaint: requestData.chief_complaint,
      urgency: requestData.urgency || 'normal',
      status: 'pending',
      processed_by: undefined,
      processed_at: undefined,
      rejection_reason: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Add the matching appointment type data
      appointment_type: {
        id: requestData.appointment_type_id,
        name: this.getAppointmentTypeName(requestData.appointment_type_id),
        description: '',
        duration_minutes: 15,
        color_code: '#3B82F6',
        is_active: true,
        requires_doctor: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    // Save to localStorage for offline functionality
    try {
      const existingRequests = JSON.parse(localStorage.getItem('offline_appointment_requests') || '[]');
      existingRequests.push(appointmentRequest);
      localStorage.setItem('offline_appointment_requests', JSON.stringify(existingRequests));
      console.log('✅ Appointment request saved offline');
    } catch (storageError) {
      console.error('Failed to save to localStorage:', storageError);
    }
    
    return appointmentRequest;
  },

  /**
   * Helper function to get appointment type name by ID
   */
  getAppointmentTypeName(typeId: string): string {
    const typeMap: { [key: string]: string } = {
      'fixed-type-algemeen': 'Algemene afspraak',
      'fixed-type-controle': 'Controle afspraak',
      'fixed-type-spoed': 'Spoed consult',
      'fixed-type-bloeddruk': 'Bloeddruk controle',
      'fixed-type-vaccinatie': 'Vaccinatie'
    };
    return typeMap[typeId] || 'Onbekend type';
  },

  /**
   * Process appointment request (approve/reject)
   */
  async processRequest(
    id: string, 
    status: 'approved' | 'rejected', 
    processedBy: string,
    rejectionReason?: string
  ): Promise<AppointmentRequest> {
    const updateData: any = {
      status,
      processed_by: processedBy,
      processed_at: new Date().toISOString()
    };
    
    if (rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }
    
    const { data, error } = await supabase
      .from('appointment_requests')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        appointment_type:appointment_types(*),
        processed_by_user:users(*)
      `)
      .single();
    
    if (error) {
      handleError(error, `Error processing appointment request ${id}`);
      throw error;
    }
    
    return data;
  }
};

/**
 * APPOINTMENT TYPES QUERIES
 */
const appointmentTypeQueries = {
  /**
   * Get all active appointment types (fixed list)
   */
  async getActiveTypes(): Promise<AppointmentType[]> {
    // Return fixed appointment types instead of database query
    return [
      {
        id: 'fixed-type-algemeen',
        name: 'Algemene afspraak',
        description: 'Standaard huisarts consulten en klachten',
        duration_minutes: 15,
        color_code: '#3B82F6',
        is_active: true,
        requires_doctor: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fixed-type-controle',
        name: 'Controle afspraak',
        description: 'Follow-up na behandeling',
        duration_minutes: 10,
        color_code: '#10B981',
        is_active: true,
        requires_doctor: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fixed-type-spoed',
        name: 'Spoed consult',
        description: 'Urgente medische hulp',
        duration_minutes: 20,
        color_code: '#EF4444',
        is_active: true,
        requires_doctor: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fixed-type-bloeddruk',
        name: 'Bloeddruk controle',
        description: 'Routine bloeddruk meting',
        duration_minutes: 10,
        color_code: '#84CC16',
        is_active: true,
        requires_doctor: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fixed-type-vaccinatie',
        name: 'Vaccinatie',
        description: 'Inentingen en vaccinaties',
        duration_minutes: 10,
        color_code: '#8B5CF6',
        is_active: true,
        requires_doctor: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
};

/**
 * PRACTICE LOCATION QUERIES
 */
const practiceLocationQueries = {
  /**
   * Get all practice locations (fixed location: Spaarnepoort 1)
   */
  async getAllLocations(): Promise<PracticeLocation[]> {
    // Return fixed location instead of database query
    return [{
      id: 'fixed-location-spaarnepoort',
      name: 'BV Floriande - Spaarnepoort',
      address: 'Spaarnepoort 1',
      postal_code: '2134 TM',
      city: 'Hoofddorp',
      phone: '023-5630350',
      email: 'info@bvfloriande.nl',
      is_main_location: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];
  },

  /**
   * Get main practice location (fixed location: Spaarnepoort 1)
   */
  async getMainLocation(): Promise<PracticeLocation | null> {
    // Return fixed location instead of database query
    return {
      id: 'fixed-location-spaarnepoort',
      name: 'BV Floriande - Spaarnepoort',
      address: 'Spaarnepoort 1',
      postal_code: '2134 TM',
      city: 'Hoofddorp',
      phone: '023-5630350',
      email: 'info@bvfloriande.nl',
      is_main_location: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
};

/**
 * DASHBOARD STATISTICS QUERIES
 */
const dashboardQueries = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get total patients count
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Get today's appointments count
      const today = new Date().toISOString().split('T')[0];
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_at', today + 'T00:00:00')
        .lt('scheduled_at', today + 'T23:59:59');

      // Get pending requests count
      const { count: pendingRequests } = await supabase
        .from('appointment_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get completed appointments this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { count: weeklyCompleted } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('scheduled_at', weekStart.toISOString());

      // Get upcoming appointments
      const upcomingAppointments = await appointmentQueries.getUpcomingAppointments();
      
      // Get recent patients
      const recentPatients = await patientQueries.getRecentPatients();

      return {
        total_patients: totalPatients || 0,
        total_appointments_today: todayAppointments || 0,
        pending_requests: pendingRequests || 0,
        completed_appointments_this_week: weeklyCompleted || 0,
        upcoming_appointments: upcomingAppointments.slice(0, 5),
        recent_patients: recentPatients.slice(0, 5)
      };
    } catch (error) {
      handleError(error, 'Error fetching dashboard statistics');
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

/**
 * AVAILABILITY QUERIES (Werkproces 2: Automatisering)
 */
const availabilityQueries = {
  /**
   * Get available time slots for a specific date and appointment type
   */
  async getAvailableTimeSlots(request: AvailabilityRequest): Promise<TimeSlot[]> {
    try {
      // Get doctor schedules for the requested date
      const dayOfWeek = new Date(request.date).getDay() || 7; // Convert Sunday (0) to 7
      
      let scheduleQuery = supabase
        .from('doctor_schedules')
        .select(`
          *,
          doctor:users!doctor_schedules_doctor_id_fkey(id, name),
          location:practice_locations(*)
        `)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

      if (request.doctor_id) {
        scheduleQuery = scheduleQuery.eq('doctor_id', request.doctor_id);
      }

      if (request.location_id) {
        scheduleQuery = scheduleQuery.eq('location_id', request.location_id);
      }

      const { data: schedules, error: scheduleError } = await scheduleQuery;

      if (scheduleError) {
        handleError(scheduleError, 'Error fetching doctor schedules');
        return [];
      }

      // Get existing appointments for the date
      const { data: existingAppointments, error: appointmentError } = await supabase
        .from('appointments')
        .select('scheduled_at, end_time, doctor_id')
        .gte('scheduled_at', request.date + 'T00:00:00')
        .lt('scheduled_at', request.date + 'T23:59:59')
        .neq('status', 'cancelled');

      if (appointmentError) {
        handleError(appointmentError, 'Error fetching existing appointments');
        return [];
      }

      // Get appointment type duration
      const { data: appointmentType, error: typeError } = await supabase
        .from('appointment_types')
        .select('duration_minutes')
        .eq('id', request.appointment_type_id)
        .single();

      if (typeError) {
        handleError(typeError, 'Error fetching appointment type');
        return [];
      }

      // Generate time slots
      const timeSlots: TimeSlot[] = [];
      const duration = appointmentType.duration_minutes || 15;

      schedules?.forEach(schedule => {
        const startTime = schedule.start_time;
        const endTime = schedule.end_time;
        const breakStart = schedule.break_start;
        const breakEnd = schedule.break_end;

        // Generate 15-minute slots
        for (let hour = parseInt(startTime.split(':')[0]); hour < parseInt(endTime.split(':')[0]); hour++) {
          for (let minute = 0; minute < 60; minute += 15) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Skip if in break time
            if (breakStart && breakEnd && timeStr >= breakStart && timeStr < breakEnd) {
              continue;
            }

            // Check if slot is available
            const slotDateTime = `${request.date}T${timeStr}:00`;
            const slotEndTime = new Date(new Date(slotDateTime).getTime() + duration * 60000);

            const isBooked = existingAppointments?.some(apt => {
              const aptStart = new Date(apt.scheduled_at);
              const aptEnd = new Date(apt.end_time);
              return apt.doctor_id === schedule.doctor_id &&
                     ((new Date(slotDateTime) >= aptStart && new Date(slotDateTime) < aptEnd) ||
                      (slotEndTime > aptStart && slotEndTime <= aptEnd));
            });

            timeSlots.push({
              time: timeStr,
              available: !isBooked,
              doctor_id: schedule.doctor_id,
              doctor_name: schedule.doctor?.name,
              appointment_type_id: request.appointment_type_id
            });
          }
        }
      });

      return timeSlots.sort((a, b) => a.time.localeCompare(b.time));
    } catch (error) {
      handleError(error, 'Error generating available time slots');
      return [];
    }
  }
};

/**
 * MEDICAL RECORDS QUERIES (Werkproces 3: Database management)
 */
const medicalRecordQueries = {
  /**
   * Get medical records with filters
   */
  async getMedicalRecords(filters: MedicalRecordFilters = {}): Promise<MedicalRecord[]> {
    let query = supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients(id, name, patient_number),
        doctor:users!medical_records_doctor_id_fkey(id, name, specialization),
        appointment:appointments(id, scheduled_at)
      `)
      .order('created_at', { ascending: false });

    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }

    if (filters.doctor_id) {
      query = query.eq('doctor_id', filters.doctor_id);
    }

    if (filters.record_type) {
      query = query.eq('record_type', filters.record_type);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters.confidential !== undefined) {
      query = query.eq('confidential', filters.confidential);
    }

    const { data, error } = await query;

    if (error) {
      handleError(error, 'Error fetching medical records');
      return [];
    }

    return data || [];
  },

  /**
   * Create medical record
   */
  async createMedicalRecord(recordData: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MedicalRecord> {
    const { data, error } = await supabase
      .from('medical_records')
      .insert([recordData])
      .select(`
        *,
        patient:patients(id, name, patient_number),
        doctor:users!medical_records_doctor_id_fkey(id, name, specialization),
        appointment:appointments(id, scheduled_at)
      `)
      .single();

    if (error) {
      handleError(error, 'Error creating medical record');
      throw error;
    }

    return data;
  }
};

/**
 * PRESCRIPTION QUERIES (Werkproces 3: Database management)
 */
const prescriptionQueries = {
  /**
   * Get prescriptions for a patient
   */
  async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patients(id, name, patient_number),
        doctor:users!prescriptions_doctor_id_fkey(id, name, specialization),
        appointment:appointments(id, scheduled_at)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      handleError(error, 'Error fetching prescriptions');
      return [];
    }

    return data || [];
  },

  /**
   * Create prescription
   */
  async createPrescription(prescriptionData: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>): Promise<Prescription> {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([prescriptionData])
      .select(`
        *,
        patient:patients(id, name, patient_number),
        doctor:users!prescriptions_doctor_id_fkey(id, name, specialization),
        appointment:appointments(id, scheduled_at)
      `)
      .single();

    if (error) {
      handleError(error, 'Error creating prescription');
      throw error;
    }

    return data;
  }
};

/**
 * AUTOMATION TRACKING QUERIES (Werkproces 2: Process Automation)
 */
const automationQueries = {
  /**
   * Log automation process
   */
  async logAutomationProcess(log: Omit<AutomationLog, 'id' | 'created_at'>): Promise<AutomationLog> {
    const { data, error } = await supabase
      .from('automation_logs')
      .insert([{
        ...log,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      handleError(error, 'Error logging automation process');
      throw error;
    }

    return data;
  },

  /**
   * Update automation process status
   */
  async updateAutomationStatus(
    id: string, 
    status: AutomationLog['status'], 
    result?: any, 
    errorMessage?: string
  ): Promise<AutomationLog> {
    const updateData: any = {
      status,
      completed_at: new Date().toISOString()
    };

    if (result) updateData.result = result;
    if (errorMessage) updateData.error_message = errorMessage;

    const { data, error } = await supabase
      .from('automation_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleError(error, 'Error updating automation status');
      throw error;
    }

    return data;
  }
};

/**
 * ENHANCED EMAIL NOTIFICATION QUERIES (Werkproces 2: Process Automation)
 */
const emailQueries = {
  /**
   * Send appointment confirmation email with automation tracking
   */
  async sendAppointmentConfirmation(appointmentId: string): Promise<boolean> {
    try {
      // Log automation start
      const logEntry = await automationQueries.logAutomationProcess({
        process_type: 'email_notification',
        entity_id: appointmentId,
        status: 'processing'
      });

      // Get appointment details
      const appointment = await appointmentQueries.getAppointments({ 
        // Filter for specific appointment - this would need the appointment ID filter
      });

      if (!appointment.length) {
        await automationQueries.updateAutomationStatus(
          logEntry.id, 
          'failed', 
          null, 
          'Appointment not found'
        );
        return false;
      }

      const apt = appointment[0];
      
      // Prepare email data
      const emailData: EmailNotification = {
        to: apt.patient?.email || '',
        subject: 'Afspraak bevestiging - MedCheck+',
        template: 'appointment_confirmation',
        data: {
          patient_name: apt.patient?.name,
          appointment_date: apt.scheduled_at,
          doctor_name: apt.doctor?.name,
          location_name: apt.location?.name
        }
      };

      // TODO: Integrate with SendGrid or email service
      console.log('Sending email:', emailData);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));

      await automationQueries.updateAutomationStatus(
        logEntry.id, 
        'completed', 
        { email_sent: true, recipient: emailData.to }
      );

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  },

  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminder(appointmentId: string): Promise<boolean> {
    try {
      const logEntry = await automationQueries.logAutomationProcess({
        process_type: 'reminder',
        entity_id: appointmentId,
        status: 'processing'
      });

      // TODO: Implement SendGrid email sending
      console.log(`Sending reminder for appointment ${appointmentId}`);
      
      await automationQueries.updateAutomationStatus(
        logEntry.id, 
        'completed', 
        { reminder_sent: true }
      );

      return true;
    } catch (error) {
      console.error('Reminder sending failed:', error);
      return false;
    }
  },

  /**
   * Send staff notification email
   */
  async sendStaffNotification(type: string, data: any): Promise<boolean> {
    try {
      const logEntry = await automationQueries.logAutomationProcess({
        process_type: 'email_notification',
        entity_id: data.id || 'unknown',
        status: 'processing'
      });

      // TODO: Implement SendGrid email sending
      console.log(`Sending staff notification of type ${type}`, data);
      
      await automationQueries.updateAutomationStatus(
        logEntry.id, 
        'completed', 
        { notification_type: type, data }
      );

      return true;
    } catch (error) {
      console.error('Staff notification failed:', error);
      return false;
    }
  }
};

// Export enhanced appointment queries with scheduling
const enhancedAppointmentQueries = {
  ...appointmentQueries,

  /**
   * Create appointment from approved request (Werkproces 2: Automation)
   */
  async createAppointmentFromRequest(requestId: string, doctorId: string): Promise<Appointment> {
    try {
      // Get the request
      const { data: request, error: requestError } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) {
        throw requestError;
      }

      // Create or find patient
      let patientId = request.patient_id;
      if (!patientId) {
        // Create new patient
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert([{
            name: request.patient_name,
            email: request.patient_email,
            phone: request.patient_phone,
            birth_date: request.patient_birth_date,
            gp_patient: false
          }])
          .select()
          .single();

        if (patientError) {
          throw patientError;
        }

        patientId = newPatient.id;
      }

      // Get appointment type duration
      const { data: appointmentType, error: typeError } = await supabase
        .from('appointment_types')
        .select('duration_minutes')
        .eq('id', request.appointment_type_id)
        .single();

      if (typeError) {
        throw typeError;
      }

      // Calculate end time
      const startTime = new Date(`${request.preferred_date}T${request.preferred_time || '09:00'}:00`);
      const endTime = new Date(startTime.getTime() + (appointmentType.duration_minutes * 60000));

      // Create appointment
      const appointmentData: CreateAppointmentRequest = {
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_type_id: request.appointment_type_id,
        scheduled_at: startTime.toISOString(),
        chief_complaint: request.chief_complaint
      };

      const appointment = await appointmentQueries.createAppointment({
        ...appointmentData,
        end_time: endTime.toISOString(),
        status: 'scheduled',
        follow_up_needed: false
      });

      // Update request status
      await supabase
        .from('appointment_requests')
        .update({ 
          status: 'scheduled',
          processed_at: new Date().toISOString(),
          processed_by: doctorId
        })
        .eq('id', requestId);

      // Send confirmation email
      await emailQueries.sendAppointmentConfirmation(appointment.id);

      return appointment;
    } catch (error) {
      handleError(error, 'Error creating appointment from request');
      throw error;
    }
  }
};

/**
 * DEBUG QUERIES
 */
const debugQueries = {
  /**
   * Test Supabase connection and basic queries
   */
  async testConnection() {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Test basic connection
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth test:', { user: user?.id, authError });
      
      // Test table access
      const { data: appointmentTypes, error: typesError } = await supabase
        .from('appointment_types')
        .select('id, name')
        .limit(1);
      
      console.log('Appointment types test:', { 
        count: appointmentTypes?.length, 
        error: typesError,
        firstType: appointmentTypes?.[0]
      });
      
      // Test appointment_requests table
      const { data: requests, error: requestsError } = await supabase
        .from('appointment_requests')
        .select('id')
        .limit(1);
      
      console.log('Appointment requests test:', { 
        count: requests?.length, 
        error: requestsError 
      });
      
      return {
        authWorking: !authError,
        typesWorking: !typesError,
        requestsWorking: !requestsError
      };
    } catch (error) {
      console.error('Debug test failed:', error);
      return { error };
    }
  }
};

// Test function for offline mode
const testOfflineMode = async () => {
  console.log('🧪 Testing offline mode...');
  try {
    const types = await appointmentTypeQueries.getActiveTypes();
    const location = await practiceLocationQueries.getMainLocation();
    console.log('✅ Appointment types:', types.length);
    console.log('✅ Practice location:', location?.name);
    return { types, location };
  } catch (error) {
    console.error('❌ Offline mode test failed:', error);
    return null;
  }
};

// Export all query modules
export {
  userQueries,
  patientQueries,
  appointmentQueries,
  appointmentRequestQueries,
  appointmentTypeQueries,
  practiceLocationQueries,
  dashboardQueries,
  emailQueries,
  availabilityQueries,
  medicalRecordQueries,
  prescriptionQueries,
  automationQueries,
  enhancedAppointmentQueries,
  debugQueries,
  debugSupabaseConnection,
  testOfflineMode
};
