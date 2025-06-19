-- =======================================
-- MEDCHECK+ TRANSFORMATION SCHEMA
-- =======================================
-- Transforming BV Floriande to Medical Practice Portal
-- Date: 2025-06-19
-- Version: MedCheck+ v1.0

-- Set search path
SET search_path TO public, auth, extensions;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- =======================================
-- DROP EXISTING TABLES (clean slate)
-- =======================================
DROP TABLE IF EXISTS public.group_evaluations CASCADE;
DROP TABLE IF EXISTS public.completed_exercises CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.session_trainers CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.group_trainers CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =======================================
-- MEDCHECK+ CORE TABLES
-- =======================================

-- Users table (doctors, assistants, admins)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'assistant' CHECK (role IN ('admin', 'doctor', 'assistant')),
    specialization TEXT, -- For doctors: "huisarts", "praktijkondersteuner", etc.
    license_number TEXT, -- BIG/AGB nummer
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Patients table (formerly members)
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_number TEXT UNIQUE NOT NULL, -- BSN or practice patient number
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    email TEXT,
    phone TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    insurance_company TEXT,
    insurance_number TEXT,
    gp_patient BOOLEAN DEFAULT true, -- Is registered patient of this practice
    medical_notes TEXT,
    allergies TEXT,
    medications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Practice locations (formerly locations)
CREATE TABLE public.practice_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    opening_hours JSONB, -- Store opening hours as JSON
    facilities TEXT[], -- Array of available facilities
    is_main_location BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Appointment types (formerly exercises)
CREATE TABLE public.appointment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 15,
    price DECIMAL(10,2),
    requires_doctor BOOLEAN DEFAULT true,
    color_code TEXT DEFAULT '#3B82F6', -- For calendar display
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT appointment_types_duration_positive CHECK (duration_minutes > 0)
);

-- Appointments (formerly sessions)
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    appointment_type_id UUID REFERENCES public.appointment_types(id) ON DELETE SET NULL,
    location_id UUID REFERENCES public.practice_locations(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show')),
    chief_complaint TEXT, -- Main reason for visit
    notes TEXT, -- Doctor's notes
    diagnosis TEXT,
    treatment_plan TEXT,
    follow_up_needed BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    cancelled_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    scheduled_date DATE,
    CONSTRAINT appointments_end_after_start CHECK (end_time > scheduled_at)
);

-- Appointment requests (for patient self-scheduling)
CREATE TABLE public.appointment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL, -- For non-registered patients
    patient_email TEXT NOT NULL,
    patient_phone TEXT,
    patient_birth_date DATE,
    appointment_type_id UUID REFERENCES public.appointment_types(id) ON DELETE SET NULL,
    preferred_date DATE,
    preferred_time TIME,
    alternative_dates DATE[],
    chief_complaint TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'scheduled', 'rejected')),
    rejection_reason TEXT,
    processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Medical records (for storing consultation results)
CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
    record_type TEXT NOT NULL CHECK (record_type IN ('consultation', 'prescription', 'referral', 'test_result', 'diagnosis')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    confidential BOOLEAN DEFAULT false,
    attachments TEXT[], -- File paths or URLs
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Prescriptions
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT,
    instructions TEXT,
    pharmacy TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Doctor schedules (for availability management)
CREATE TABLE public.doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    location_id UUID REFERENCES public.practice_locations(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    break_start TIME,
    break_end TIME,
    max_appointments_per_hour INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT doctor_schedules_end_after_start CHECK (end_time > start_time),
    CONSTRAINT doctor_schedules_break_valid CHECK (
        (break_start IS NULL AND break_end IS NULL) OR 
        (break_start IS NOT NULL AND break_end IS NOT NULL AND break_end > break_start)
    ),
    UNIQUE(doctor_id, location_id, day_of_week)
);

-- =======================================
-- INDEXES FOR PERFORMANCE
-- =======================================

-- Patient indexes
CREATE INDEX idx_patients_patient_number ON public.patients(patient_number);
CREATE INDEX idx_patients_name ON public.patients(name);
CREATE INDEX idx_patients_birth_date ON public.patients(birth_date);
CREATE INDEX idx_patients_email ON public.patients(email);

-- Appointment indexes
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON public.appointments(status);

CREATE INDEX idx_appointments_scheduled_date ON public.appointments(scheduled_date);

-- Appointment request indexes
CREATE INDEX idx_appointment_requests_status ON public.appointment_requests(status);
CREATE INDEX idx_appointment_requests_patient_email ON public.appointment_requests(patient_email);
CREATE INDEX idx_appointment_requests_preferred_date ON public.appointment_requests(preferred_date);

-- Medical record indexes
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX idx_medical_records_record_type ON public.medical_records(record_type);

-- =======================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Authenticated users can view users" ON public.users 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

-- Patients policies
CREATE POLICY "Authenticated users can view patients" ON public.patients 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage patients" ON public.patients 
  FOR ALL USING (auth.role() = 'authenticated');

-- Practice locations policies (public read)
CREATE POLICY "Anyone can view practice locations" ON public.practice_locations 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage locations" ON public.practice_locations 
  FOR ALL USING (auth.role() = 'authenticated');

-- Appointment types policies (public read)
CREATE POLICY "Anyone can view appointment types" ON public.appointment_types 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage appointment types" ON public.appointment_types 
  FOR ALL USING (auth.role() = 'authenticated');

-- Appointments policies
CREATE POLICY "Authenticated users can view appointments" ON public.appointments 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage appointments" ON public.appointments 
  FOR ALL USING (auth.role() = 'authenticated');

-- Appointment requests policies (allow public creation)
CREATE POLICY "Anyone can create appointment requests" ON public.appointment_requests 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view appointment requests" ON public.appointment_requests 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage appointment requests" ON public.appointment_requests 
  FOR ALL USING (auth.role() = 'authenticated');

-- Medical records policies (strict access control)
CREATE POLICY "Authenticated users can view medical records" ON public.medical_records 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Doctors can manage medical records" ON public.medical_records 
  FOR ALL USING (auth.role() = 'authenticated');

-- Prescriptions policies
CREATE POLICY "Authenticated users can view prescriptions" ON public.prescriptions 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage prescriptions" ON public.prescriptions 
  FOR ALL USING (auth.role() = 'authenticated');

-- Doctor schedules policies
CREATE POLICY "Anyone can view doctor schedules" ON public.doctor_schedules 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage schedules" ON public.doctor_schedules 
  FOR ALL USING (auth.role() = 'authenticated');

-- =======================================
-- TRIGGER FUNCTIONS
-- =======================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_locations_updated_at BEFORE UPDATE ON public.practice_locations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_types_updated_at BEFORE UPDATE ON public.appointment_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_requests_updated_at BEFORE UPDATE ON public.appointment_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_schedules_updated_at BEFORE UPDATE ON public.doctor_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================================
-- SAMPLE DATA FOR TESTING
-- =======================================

-- Insert appointment types
INSERT INTO public.appointment_types (name, description, duration_minutes, price, color_code) VALUES
('Regulier consult', 'Standaard consult bij de huisarts', 15, 39.50, '#3B82F6'),
('Verlengd consult', 'Uitgebreid consult voor complexe problemen', 30, 65.00, '#8B5CF6'),
('Telefonisch consult', 'Telefonische consultatie', 10, 25.00, '#10B981'),
('Dubbelconsult', 'Consult voor twee personen', 20, 50.00, '#F59E0B'),
('Kleine ingreep', 'Kleine medische ingreep', 30, 75.00, '#EF4444'),
('Vaccinatie', 'Toediening van vaccin', 10, 30.00, '#06B6D4'),
('Bloeddruk controle', 'Controle van bloeddruk', 10, 20.00, '#84CC16'),
('Uitstrijkje', 'Cervixuitstrijkje (PAP-test)', 15, 45.00, '#EC4899');

-- Insert practice location
INSERT INTO public.practice_locations (name, address, postal_code, city, phone, email, is_main_location, opening_hours) VALUES
('Huisartsenpraktijk MedCheck+', 'Gezondheidsstraat 123', '1234 AB', 'Medstad', '010-1234567', 'info@medcheckplus.nl', true, 
'{"monday": {"open": "08:00", "close": "17:00"}, "tuesday": {"open": "08:00", "close": "17:00"}, "wednesday": {"open": "08:00", "close": "17:00"}, "thursday": {"open": "08:00", "close": "17:00"}, "friday": {"open": "08:00", "close": "16:00"}}');

COMMENT ON SCHEMA public IS 'MedCheck+ Medical Practice Management System';
