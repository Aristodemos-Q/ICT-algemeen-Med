-- =======================================
-- MEDCHECK+ TRANSFORMATION SCHEMA
-- =======================================

-- First, ensure users table exists (run create_users_table.sql first if needed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        RAISE EXCEPTION 'Users table does not exist. Please run create_users_table.sql first.';
    END IF;
END $$;

-- Drop existing BV Floriande tables if they exist
DROP TABLE IF EXISTS public.session_trainers CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.completed_exercises CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.group_trainers CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.approved_emails CASCADE;
DROP TABLE IF EXISTS public.registration_requests CASCADE;

-- Drop existing MedCheck+ tables if they exist to allow clean recreation
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.medical_records CASCADE;
DROP TABLE IF EXISTS public.appointment_requests CASCADE;
DROP TABLE IF EXISTS public.doctor_schedules CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.appointment_types CASCADE;
DROP TABLE IF EXISTS public.practice_locations CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;

-- Update users table for medical practice (keep existing structure, add medical fields)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update role check to include medical roles
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('admin', 'trainer', 'doctor', 'assistant'));

-- Practice locations
CREATE TABLE public.practice_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    opening_hours JSONB,
    facilities TEXT[],
    is_main_location BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Appointment types
CREATE TABLE public.appointment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 15,
    price DECIMAL(10,2),
    requires_doctor BOOLEAN DEFAULT true,
    color_code TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Patients
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    birth_date DATE,
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
    gp_patient BOOLEAN DEFAULT false,
    medical_notes TEXT,
    allergies TEXT,
    medications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Appointments
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    appointment_type_id UUID REFERENCES public.appointment_types(id) ON DELETE SET NULL,
    location_id UUID REFERENCES public.practice_locations(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show')),
    chief_complaint TEXT,
    notes TEXT,
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

-- Medical records
CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL CHECK (record_type IN ('consultation', 'prescription', 'referral', 'test_result', 'diagnosis')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    confidential BOOLEAN DEFAULT false,
    attachments TEXT[],
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Prescriptions
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT,
    instructions TEXT,
    pharmacy TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Doctor schedules
CREATE TABLE public.doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.practice_locations(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    break_start TIME,
    break_end TIME,
    max_appointments_per_hour INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(doctor_id, location_id, day_of_week)
);

-- Insert sample data
INSERT INTO public.practice_locations (name, address, postal_code, city, phone, email, is_main_location, opening_hours, facilities) VALUES
('Huisartsenpraktijk MedCheck+', 'Gezondheidsstraat 123', '1234 AB', 'Medstad', '010-1234567', 'info@medcheckplus.nl', true, 
 '{"monday": {"open": "08:00", "close": "17:00"}, "tuesday": {"open": "08:00", "close": "17:00"}, "wednesday": {"open": "08:00", "close": "17:00"}, "thursday": {"open": "08:00", "close": "17:00"}, "friday": {"open": "08:00", "close": "16:00"}}',
 ARRAY['Digitale radiologie', 'ECG', 'Spirometrie', 'Kleine chirurgie']);

INSERT INTO public.appointment_types (name, description, duration_minutes, price, requires_doctor, color_code) VALUES
('Regulier consult', 'Standaard consult bij de huisarts', 15, 39.50, true, '#3B82F6'),
('Verlengd consult', 'Uitgebreid consult voor complexe problemen', 30, 65.00, true, '#8B5CF6'),
('Telefonisch consult', 'Telefonische consultatie', 10, 25.00, true, '#10B981'),
('Kleine ingreep', 'Kleine medische ingreep', 30, 75.00, true, '#EF4444'),
('Vaccinatie', 'Toediening van vaccin', 10, 30.00, false, '#06B6D4'),
('Bloeddruk controle', 'Controle van bloeddruk', 10, 20.00, false, '#84CC16'),
('Uitslagbespreking', 'Bespreking van onderzoeksresultaten', 15, 35.00, true, '#F59E0B'),
('Intake nieuw patient', 'Uitgebreide intake voor nieuwe patiënten', 45, 85.00, true, '#EF4444');

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_practice_locations_updated_at BEFORE UPDATE ON public.practice_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointment_types_updated_at BEFORE UPDATE ON public.appointment_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointment_requests_updated_at BEFORE UPDATE ON public.appointment_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doctor_schedules_updated_at BEFORE UPDATE ON public.doctor_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.practice_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all for authenticated users for now)
CREATE POLICY "Public read access for practice locations" ON public.practice_locations FOR SELECT USING (true);
CREATE POLICY "Public read access for appointment types" ON public.appointment_types FOR SELECT USING (is_active = true);
CREATE POLICY "Public insert for appointment requests" ON public.appointment_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can manage patients" ON public.patients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage appointment requests" ON public.appointment_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage medical records" ON public.medical_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage prescriptions" ON public.prescriptions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage doctor schedules" ON public.doctor_schedules FOR ALL USING (auth.role() = 'authenticated');

-- Function to generate patient numbers
CREATE OR REPLACE FUNCTION public.generate_patient_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_part TEXT;
    sequence_part INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(patient_number FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM public.patients
    WHERE patient_number LIKE year_part || '%';
    
    new_number := year_part || LPAD(sequence_part::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate patient numbers
CREATE OR REPLACE FUNCTION public.set_patient_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.patient_number IS NULL OR NEW.patient_number = '' THEN
        NEW.patient_number := generate_patient_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_patient_number_trigger
    BEFORE INSERT ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.set_patient_number();

-- Sample patients for testing
INSERT INTO public.patients (name, birth_date, gender, email, phone, gp_patient) VALUES
('Maria van der Berg', '1985-03-15', 'female', 'maria@example.com', '06-12345678', true),
('Jan Janssen', '1970-08-22', 'male', 'jan@example.com', '06-87654321', true),
('Emma de Vries', '1992-11-05', 'female', 'emma@example.com', '06-11223344', false);

-- Sample appointment requests for testing
INSERT INTO public.appointment_requests (patient_name, patient_email, patient_phone, chief_complaint, urgency, preferred_date, appointment_type_id) 
SELECT 
    'Test Patient',
    'test@example.com',
    '06-99887766',
    'Hoofdpijn en koorts sinds 2 dagen',
    'normal',
    CURRENT_DATE + INTERVAL '3 days',
    id
FROM public.appointment_types 
WHERE name = 'Regulier consult'
LIMIT 1;

COMMIT;
