-- =============================================================================
-- SIMPLE FIX: Add only the missing patient_email column
-- =============================================================================
-- Run dit ALLEEN als je al een werkende database hebt en alleen de patient_email kolom mist

-- Add patient_email column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'patient_email'
    ) THEN
        ALTER TABLE appointments ADD COLUMN patient_email VARCHAR(255);
    END IF;
END $$;

-- Create index for performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_appointments_patient_email'
    ) THEN
        CREATE INDEX idx_appointments_patient_email ON appointments(patient_email);
    END IF;
END $$;

-- Ensure users table has the required doctor user (fix foreign key issue)
INSERT INTO users (id, email, name, role, phone, specialization, license_number) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', 'dr.huisarts@bvfloriande.nl', 'Dr. A. Huisarts', 'doctor', '020-1234567', 'Huisartsgeneeskunde', 'BIG123456789'),
    ('770e8400-e29b-41d4-a716-446655440002', 'admin@bvfloriande.nl', 'Praktijk Manager', 'admin', '020-1234568', null, null)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    specialization = EXCLUDED.specialization,
    license_number = EXCLUDED.license_number;

-- Update existing appointments to populate patient_email from patients table
-- (Only if there are existing appointments without patient_email)
UPDATE appointments 
SET patient_email = patients.email 
FROM patients 
WHERE appointments.patient_id = patients.id 
AND (appointments.patient_email IS NULL OR appointments.patient_email = '');

-- Check if the fix worked
SELECT 
    COUNT(*) as total_appointments,
    COUNT(patient_email) as appointments_with_email,
    COUNT(*) - COUNT(patient_email) as appointments_missing_email
FROM appointments;

-- Also check if all required tables exist and have data
SELECT 
    'appointments' as table_name, 
    COUNT(*) as row_count 
FROM appointments
UNION ALL
SELECT 
    'appointment_requests' as table_name, 
    COUNT(*) as row_count 
FROM appointment_requests
UNION ALL
SELECT 
    'appointment_types' as table_name, 
    COUNT(*) as row_count 
FROM appointment_types
UNION ALL
SELECT 
    'practice_locations' as table_name, 
    COUNT(*) as row_count 
FROM practice_locations
UNION ALL
SELECT 
    'users' as table_name, 
    COUNT(*) as row_count 
FROM users;
