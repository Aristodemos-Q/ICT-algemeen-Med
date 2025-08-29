-- =============================================================================
-- MedCheck+ Complete Supabase Database Setup
-- =============================================================================
-- Deze SQL queries moeten uitgevoerd worden in de Supabase SQL Editor
-- in de juiste volgorde om alle tabellen en policies aan te maken.

-- =============================================================================
-- 1. CLEANUP EXISTING CONSTRAINTS (FIX CONSTRAINT ERRORS)
-- =============================================================================
-- Deze cleanup zorgt ervoor dat bestaande problematische constraints worden verwijderd

-- Drop problematic foreign key constraints that might exist
DO $$
BEGIN
    -- Drop users_id_fkey if it exists (this is causing the error)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_id_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;
        RAISE NOTICE 'Dropped problematic users_id_fkey constraint';
    END IF;
    
    -- Drop other potentially problematic constraints
    PERFORM pg_sleep(0.1); -- Small delay for safety
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint cleanup completed with some expected errors: %', SQLERRM;
END $$;

-- =============================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS) EXTENSIONS
-- =============================================================================
-- Deze moeten als eerste worden uitgevoerd

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
-- Dit wordt automatisch gedaan, maar zeker weten dat het aan staat
-- (geen aparte query nodig)

-- =============================================================================
-- 3. CREATE MAIN TABLES (WITH SAFE RECREATION)
-- =============================================================================

-- 3.1 Users table (authentication) - Drop and recreate to fix constraints
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'patient' CHECK (role IN ('admin', 'doctor', 'patient', 'staff')),
    phone VARCHAR(20),
    specialization VARCHAR(255), -- For doctors
    license_number VARCHAR(100), -- For doctors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 Patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    address TEXT,
    postal_code VARCHAR(20),
    city VARCHAR(100),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    insurance_company VARCHAR(255),
    insurance_number VARCHAR(100),
    gp_patient BOOLEAN DEFAULT true,
    patient_number VARCHAR(50) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.3 Practice Locations table (OPTIONAL - App uses fixed location "Spaarnepoort 1")
-- This table is created for compatibility but the app uses a hardcoded location
CREATE TABLE IF NOT EXISTS public.practice_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    postal_code VARCHAR(20),
    city VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_main_location BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.4 Appointment Types table
CREATE TABLE IF NOT EXISTS public.appointment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 15,
    color_code VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.5 Appointments table (create after dependencies)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID,
    patient_email VARCHAR(255) NOT NULL, -- For easy querying
    doctor_id UUID,
    appointment_type_id UUID,
    location_id UUID,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    chief_complaint TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints AFTER all tables are created
ALTER TABLE public.appointments 
ADD CONSTRAINT fk_appointments_patient 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.appointments 
ADD CONSTRAINT fk_appointments_doctor 
FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.appointments 
ADD CONSTRAINT fk_appointments_type 
FOREIGN KEY (appointment_type_id) REFERENCES public.appointment_types(id) ON DELETE SET NULL;

ALTER TABLE public.appointments 
ADD CONSTRAINT fk_appointments_location 
FOREIGN KEY (location_id) REFERENCES public.practice_locations(id) ON DELETE SET NULL;

-- Add patient_email column if it doesn't exist (for existing databases)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'patient_email'
    ) THEN
        ALTER TABLE public.appointments ADD COLUMN patient_email VARCHAR(255);
        COMMENT ON COLUMN public.appointments.patient_email IS 'For easy querying without joins';
    END IF;
END $$;

-- 3.6 Appointment Requests table (for online booking)
CREATE TABLE IF NOT EXISTS public.appointment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(20),
    patient_birth_date DATE,
    appointment_type_id UUID,
    preferred_date DATE NOT NULL,
    preferred_time TIME,
    alternative_dates TEXT[], -- Array of alternative date strings
    chief_complaint TEXT NOT NULL,
    urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'scheduled', 'rejected')),
    processed_by VARCHAR(255), -- User ID or email who processed
    processed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for appointment requests
ALTER TABLE public.appointment_requests 
ADD CONSTRAINT fk_appointment_requests_type 
FOREIGN KEY (appointment_type_id) REFERENCES public.appointment_types(id) ON DELETE SET NULL;

-- 3.7 Doctor Schedules table (for availability)
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID,
    location_id UUID,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign keys for doctor schedules
ALTER TABLE public.doctor_schedules 
ADD CONSTRAINT fk_doctor_schedules_doctor 
FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.doctor_schedules 
ADD CONSTRAINT fk_doctor_schedules_location 
FOREIGN KEY (location_id) REFERENCES public.practice_locations(id) ON DELETE CASCADE;

-- 3.8 Medical Records table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID,
    doctor_id UUID,
    appointment_id UUID,
    record_type VARCHAR(50) DEFAULT 'consultation' CHECK (record_type IN ('consultation', 'diagnosis', 'treatment', 'referral', 'test_result')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign keys for medical records
ALTER TABLE public.medical_records 
ADD CONSTRAINT fk_medical_records_patient 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.medical_records 
ADD CONSTRAINT fk_medical_records_doctor 
FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.medical_records 
ADD CONSTRAINT fk_medical_records_appointment 
FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;

-- 3.9 Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID,
    doctor_id UUID,
    appointment_id UUID,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign keys for prescriptions
ALTER TABLE public.prescriptions 
ADD CONSTRAINT fk_prescriptions_patient 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.prescriptions 
ADD CONSTRAINT fk_prescriptions_doctor 
FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.prescriptions 
ADD CONSTRAINT fk_prescriptions_appointment 
FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;

-- 3.10 Automation Logs table (for process tracking)
CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON public.appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Appointment requests indexes
CREATE INDEX IF NOT EXISTS idx_appointment_requests_status ON public.appointment_requests(status);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_urgency ON public.appointment_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_created_at ON public.appointment_requests(created_at);

-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_patient_number ON public.patients(patient_number);

-- Medical records indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON public.medical_records(doctor_id);

-- =============================================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- =============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. CREATE RLS POLICIES (WITH SAFE RECREATION)
-- =============================================================================

-- 6.1 Users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text OR auth.email() = email);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text OR auth.email() = email);

-- 6.2 Patients policies (allow read for all authenticated users, staff can manage)
DROP POLICY IF EXISTS "Authenticated users can view patients" ON public.patients;
CREATE POLICY "Authenticated users can view patients" ON public.patients
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Staff can manage patients" ON public.patients;
CREATE POLICY "Staff can manage patients" ON public.patients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'doctor', 'staff')
        )
    );

-- 6.3 Practice locations policies (public read, staff can manage)
DROP POLICY IF EXISTS "Anyone can view practice locations" ON public.practice_locations;
CREATE POLICY "Anyone can view practice locations" ON public.practice_locations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage practice locations" ON public.practice_locations;
CREATE POLICY "Staff can manage practice locations" ON public.practice_locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'doctor', 'staff')
        )
    );

-- 6.4 Appointment types policies (public read, staff can manage)
DROP POLICY IF EXISTS "Anyone can view appointment types" ON public.appointment_types;
CREATE POLICY "Anyone can view appointment types" ON public.appointment_types
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Staff can manage appointment types" ON public.appointment_types;
CREATE POLICY "Staff can manage appointment types" ON public.appointment_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'doctor', 'staff')
        )
    );

-- 6.5 Appointments policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments" ON public.appointments
    FOR SELECT USING (
        patient_email = auth.email() OR
        doctor_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'doctor', 'staff')
        )
    );

DROP POLICY IF EXISTS "Staff can manage all appointments" ON public.appointments;
CREATE POLICY "Staff can manage all appointments" ON public.appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'doctor', 'staff')
        )
    );

-- 6.6 Appointment requests policies (anyone can create, staff can manage)
DROP POLICY IF EXISTS "Anyone can create appointment requests" ON public.appointment_requests;
CREATE POLICY "Anyone can create appointment requests" ON public.appointment_requests
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view appointment requests" ON public.appointment_requests;
CREATE POLICY "Anyone can view appointment requests" ON public.appointment_requests
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage appointment requests" ON public.appointment_requests;
CREATE POLICY "Staff can manage appointment requests" ON public.appointment_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'doctor', 'staff')
        )
    );

-- 6.7 Doctor schedules policies
DROP POLICY IF EXISTS "Anyone can view doctor schedules" ON public.doctor_schedules;
CREATE POLICY "Anyone can view doctor schedules" ON public.doctor_schedules
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Doctors can manage their own schedules" ON public.doctor_schedules;
CREATE POLICY "Doctors can manage their own schedules" ON public.doctor_schedules
    FOR ALL USING (
        doctor_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'staff')
        )
    );

-- 6.8 Medical records policies (strict access control)
DROP POLICY IF EXISTS "Patients can view their own medical records" ON public.medical_records;
CREATE POLICY "Patients can view their own medical records" ON public.medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients 
            WHERE patients.id = medical_records.patient_id 
            AND patients.email = auth.email()
        )
    );

DROP POLICY IF EXISTS "Doctors can view and manage medical records" ON public.medical_records;
CREATE POLICY "Doctors can view and manage medical records" ON public.medical_records
    FOR ALL USING (
        doctor_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'doctor')
        )
    );

-- 6.9 Prescriptions policies
DROP POLICY IF EXISTS "Patients can view their own prescriptions" ON public.prescriptions;
CREATE POLICY "Patients can view their own prescriptions" ON public.prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients 
            WHERE patients.id = prescriptions.patient_id 
            AND patients.email = auth.email()
        )
    );

DROP POLICY IF EXISTS "Doctors can manage prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors can manage prescriptions" ON public.prescriptions
    FOR ALL USING (
        doctor_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'doctor')
        )
    );

-- 6.10 Automation logs policies (staff only)
DROP POLICY IF EXISTS "Staff can view automation logs" ON public.automation_logs;
CREATE POLICY "Staff can view automation logs" ON public.automation_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'doctor', 'staff')
        )
    );

DROP POLICY IF EXISTS "Staff can create automation logs" ON public.automation_logs;
CREATE POLICY "Staff can create automation logs" ON public.automation_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'doctor', 'staff')
        )
    );

-- =============================================================================
-- 7. INSERT SAMPLE DATA
-- =============================================================================

-- 7.1 Insert sample practice locations
INSERT INTO public.practice_locations (id, name, address, postal_code, city, phone, email, is_main_location) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Hoofdlocatie BV Floriande', 'Hoofdstraat 123', '1234 AB', 'Amsterdam', '020-1234567', 'info@bvfloriande.nl', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Filiaal Centrum', 'Centrumplein 45', '1234 CD', 'Amsterdam', '020-2345678', 'centrum@bvfloriande.nl', false)
ON CONFLICT (id) DO NOTHING;

-- 7.2 Insert sample appointment types
INSERT INTO public.appointment_types (id, name, description, duration_minutes, color_code, is_active) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Regulier consult', 'Standaard huisartsconsult', 15, '#3B82F6', true),
    ('660e8400-e29b-41d4-a716-446655440002', 'Verlengd consult', 'Uitgebreid consult voor complexe problemen', 30, '#8B5CF6', true),
    ('660e8400-e29b-41d4-a716-446655440003', 'Controle afspraak', 'Follow-up na behandeling', 10, '#10B981', true),
    ('660e8400-e29b-41d4-a716-446655440004', 'Spoed consult', 'Urgente medische hulp', 20, '#EF4444', true),
    ('660e8400-e29b-41d4-a716-446655440005', 'Bloeddruk controle', 'Routine bloeddruk meting', 10, '#84CC16', true)
ON CONFLICT (id) DO NOTHING;

-- 7.3 Insert sample doctor user
INSERT INTO public.users (id, email, name, role, phone, specialization, license_number) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', 'dr.huisarts@bvfloriande.nl', 'Dr. A. Huisarts', 'doctor', '020-1234567', 'Huisartsgeneeskunde', 'BIG123456789'),
    ('770e8400-e29b-41d4-a716-446655440002', 'admin@bvfloriande.nl', 'Praktijk Manager', 'admin', '020-1234568', null, null)
ON CONFLICT (id) DO NOTHING;

-- 7.4 Insert sample doctor schedule (ONLY after users are inserted)
DO $$
BEGIN
    -- Only insert doctor schedules if the doctor user exists
    IF EXISTS (SELECT 1 FROM public.users WHERE id = '770e8400-e29b-41d4-a716-446655440001') THEN
        INSERT INTO public.doctor_schedules (doctor_id, location_id, day_of_week, start_time, end_time, is_active) VALUES
            ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1, '08:00', '17:00', true), -- Monday
            ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 2, '08:00', '17:00', true), -- Tuesday
            ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 3, '08:00', '17:00', true), -- Wednesday
            ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 4, '08:00', '17:00', true), -- Thursday
            ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 5, '08:00', '12:00', true)  -- Friday
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 7.5 Insert sample appointment request (ONLY after appointment types exist)
DO $$
BEGIN
    -- Only insert appointment request if the appointment type exists
    IF EXISTS (SELECT 1 FROM public.appointment_types WHERE id = '660e8400-e29b-41d4-a716-446655440001') THEN
        INSERT INTO public.appointment_requests (
            patient_name, 
            patient_email, 
            patient_phone, 
            patient_birth_date,
            appointment_type_id, 
            preferred_date, 
            preferred_time, 
            chief_complaint, 
            urgency, 
            status
        ) VALUES
            ('Test Patient', 'test@example.com', '06-12345678', '1990-01-01', '660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '1 day', '10:00', 'Test klacht voor demonstratie', 'normal', 'pending')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =============================================================================
-- 8. CREATE FUNCTIONS AND TRIGGERS
-- =============================================================================

-- 8.1 Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8.2 Create triggers for updated_at
DO $$
BEGIN
    -- Create triggers only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_patients_updated_at') THEN
        CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_appointments_updated_at') THEN
        CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_appointment_requests_updated_at') THEN
        CREATE TRIGGER update_appointment_requests_updated_at BEFORE UPDATE ON public.appointment_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_practice_locations_updated_at') THEN
        CREATE TRIGGER update_practice_locations_updated_at BEFORE UPDATE ON public.practice_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_appointment_types_updated_at') THEN
        CREATE TRIGGER update_appointment_types_updated_at BEFORE UPDATE ON public.appointment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_doctor_schedules_updated_at') THEN
        CREATE TRIGGER update_doctor_schedules_updated_at BEFORE UPDATE ON public.doctor_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_medical_records_updated_at') THEN
        CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_prescriptions_updated_at') THEN
        CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================================================
-- 9. FIX EXISTING DATA (RUN AFTER SETUP)
-- =============================================================================

-- 9.1 Update existing appointments to populate patient_email if missing
UPDATE public.appointments 
SET patient_email = patients.email 
FROM public.patients 
WHERE appointments.patient_id = patients.id 
AND (appointments.patient_email IS NULL OR appointments.patient_email = '');

-- 9.2 Verify the setup
DO $$
DECLARE
    table_count INTEGER;
    appointments_count INTEGER;
    requests_count INTEGER;
    types_count INTEGER;
    locations_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'patients', 'appointments', 'appointment_requests', 'appointment_types', 'practice_locations');
    
    -- Count data
    SELECT COUNT(*) INTO appointments_count FROM public.appointments;
    SELECT COUNT(*) INTO requests_count FROM public.appointment_requests;
    SELECT COUNT(*) INTO types_count FROM public.appointment_types;
    SELECT COUNT(*) INTO locations_count FROM public.practice_locations;
    
    RAISE NOTICE 'Setup complete! Tables created: %, Appointments: %, Requests: %, Types: %, Locations: %', 
        table_count, appointments_count, requests_count, types_count, locations_count;
END $$;

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================
-- Na het uitvoeren van deze queries heb je een volledig werkende MedCheck+ database
-- met alle benodigde tabellen, indexes, RLS policies en sample data.
--
-- Stappen om uit te voeren:
-- 1. Ga naar je Supabase project dashboard
-- 2. Klik op "SQL Editor" in het menu
-- 3. Maak een nieuwe query aan
-- 4. Plak deze volledige SQL code
-- 5. Voer de query uit
-- 6. Controleer of alle tabellen zijn aangemaakt in de "Table Editor"
--
-- Je kunt nu je MedCheck+ applicatie testen met deze database setup!
