-- MedCheck+ Essential Schema Setup
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.appointment_types CASCADE;
DROP TABLE IF EXISTS public.practice_locations CASCADE;

-- Users table (doctors, assistants, admins)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'assistant' CHECK (role IN ('admin', 'doctor', 'assistant')),
    specialization TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Patients table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    email TEXT,
    phone TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Practice locations
CREATE TABLE public.practice_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT,
    city TEXT,
    phone TEXT,
    is_main_location BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Appointment types
CREATE TABLE public.appointment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 15,
    price DECIMAL(10,2),
    color_code TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT appointment_types_duration_positive CHECK (duration_minutes > 0)
);

-- Appointments
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    appointment_type_id UUID REFERENCES public.appointment_types(id) ON DELETE SET NULL,
    location_id UUID REFERENCES public.practice_locations(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    chief_complaint TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT appointments_end_after_start CHECK (end_time > scheduled_at)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view users" ON public.users 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view patients" ON public.patients 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view practice locations" ON public.practice_locations 
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view appointment types" ON public.appointment_types 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can view appointments" ON public.appointments 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO public.practice_locations (name, address, postal_code, city, phone, is_main_location) VALUES
('Huisartsenpraktijk MedCheck+', 'Gezondheidsstraat 123', '1234 AB', 'Medstad', '010-1234567', true);

INSERT INTO public.appointment_types (name, description, duration_minutes, price, color_code) VALUES
('Regulier consult', 'Standaard consult bij de huisarts', 15, 39.50, '#3B82F6'),
('Verlengd consult', 'Uitgebreid consult voor complexe problemen', 30, 65.00, '#8B5CF6'),
('Telefonisch consult', 'Telefonische consultatie', 10, 25.00, '#10B981'),
('Kleine ingreep', 'Kleine medische ingreep', 30, 75.00, '#EF4444');

-- Create indexes
CREATE INDEX idx_patients_patient_number ON public.patients(patient_number);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_scheduled_date ON public.appointments(scheduled_date);

-- Function to update scheduled_date
CREATE OR REPLACE FUNCTION set_scheduled_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.scheduled_date = NEW.scheduled_at::date;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set scheduled_date
CREATE TRIGGER set_scheduled_date_trigger
    BEFORE INSERT OR UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION set_scheduled_date();

-- Updated timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
