-- ========================================
-- MedCheck+ Quick Setup Script
-- ========================================
-- Run this script in the Supabase SQL Editor to set up the appointment booking system
-- This is a simplified version that focuses on the essential tables for appointment booking

-- First ensure users table exists
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'trainer', 'doctor', 'assistant')),
    specialization TEXT,
    license_number TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Practice locations table
CREATE TABLE IF NOT EXISTS public.practice_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    is_main_location BOOLEAN DEFAULT false,
    opening_hours JSONB,
    facilities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Appointment types table
CREATE TABLE IF NOT EXISTS public.appointment_types (
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

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_number TEXT UNIQUE,
    name TEXT NOT NULL,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    email TEXT,
    phone TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    insurance_company TEXT,
    insurance_number TEXT,
    gp_patient BOOLEAN DEFAULT false,
    emergency_contact TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Appointment requests table (for the booking form)
CREATE TABLE IF NOT EXISTS public.appointment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name TEXT NOT NULL,
    patient_email TEXT NOT NULL,
    patient_phone TEXT,
    patient_birth_date DATE,
    appointment_type_id UUID REFERENCES public.appointment_types(id),
    preferred_date DATE NOT NULL,
    preferred_time TEXT,
    alternative_dates DATE[],
    chief_complaint TEXT NOT NULL,
    urgency TEXT CHECK (urgency IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
    processed_by UUID REFERENCES public.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Appointments table (actual scheduled appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id),
    doctor_id UUID REFERENCES public.users(id),
    appointment_type_id UUID REFERENCES public.appointment_types(id),
    location_id UUID REFERENCES public.practice_locations(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 15,
    status TEXT CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')) DEFAULT 'scheduled',
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access to necessary data
DROP POLICY IF EXISTS "Public read access for practice locations" ON public.practice_locations;
CREATE POLICY "Public read access for practice locations" 
ON public.practice_locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for appointment types" ON public.appointment_types;
CREATE POLICY "Public read access for appointment types" 
ON public.appointment_types FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public insert for appointment requests" ON public.appointment_requests;
CREATE POLICY "Public insert for appointment requests" 
ON public.appointment_requests FOR INSERT WITH CHECK (true);

-- Insert sample data
INSERT INTO public.practice_locations (name, address, postal_code, city, phone, email, is_main_location, opening_hours) 
VALUES (
    'MedCheck+ Huisartsenpraktijk',
    'SpaarnePoort 5',
    '2134 TM',
    'Hoofddorp',
    '023-555-0123',
    'info@medcheckplus.nl',
    true,
    '{"monday": {"open": "08:00", "close": "17:00"}, "tuesday": {"open": "08:00", "close": "17:00"}, "wednesday": {"open": "08:00", "close": "17:00"}, "thursday": {"open": "08:00", "close": "17:00"}, "friday": {"open": "08:00", "close": "16:00"}, "saturday": {"open": "09:00", "close": "12:00"}, "sunday": {"open": "Gesloten", "close": "Gesloten"}}'::jsonb
) ON CONFLICT DO NOTHING;

INSERT INTO public.appointment_types (name, description, duration_minutes, price, requires_doctor, color_code) VALUES
('Regulier consult', 'Standaard consult bij de huisarts voor algemene klachten', 15, 39.50, true, '#3B82F6'),
('Verlengd consult', 'Uitgebreid consult voor complexe problemen of meerdere klachten', 30, 65.00, true, '#8B5CF6'),
('Online consult', 'Videoconsult vanuit het comfort van uw eigen huis', 15, 35.00, true, '#06B6D4'),
('Kleine ingreep', 'Kleine medische ingreep zoals wond hechten of steenprik', 30, 75.00, true, '#EF4444'),
('Controle door assistente', 'Bloeddruk, gewicht en andere controles door de praktijkassistente', 10, 20.00, false, '#84CC16'),
('Vaccinatie', 'Toediening van vaccin door praktijkassistente', 10, 30.00, false, '#F59E0B')
ON CONFLICT DO NOTHING;

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
DROP TRIGGER IF EXISTS update_practice_locations_updated_at ON public.practice_locations;
CREATE TRIGGER update_practice_locations_updated_at 
BEFORE UPDATE ON public.practice_locations 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointment_types_updated_at ON public.appointment_types;
CREATE TRIGGER update_appointment_types_updated_at 
BEFORE UPDATE ON public.appointment_types 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at 
BEFORE UPDATE ON public.patients 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointment_requests_updated_at ON public.appointment_requests;
CREATE TRIGGER update_appointment_requests_updated_at 
BEFORE UPDATE ON public.appointment_requests 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at 
BEFORE UPDATE ON public.appointments 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Success message
SELECT 'MedCheck+ appointment booking system setup completed successfully! ✅' as result;
