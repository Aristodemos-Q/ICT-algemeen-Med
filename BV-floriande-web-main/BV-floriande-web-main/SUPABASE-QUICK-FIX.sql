-- =============================================================================
-- QUICK FIX: Add patient_email column to appointments table
-- =============================================================================
-- Deze SQL query kun je direct uitvoeren in de Supabase SQL Editor
-- om de ontbrekende patient_email kolom toe te voegen

-- Add patient_email column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments' 
        AND column_name = 'patient_email'
    ) THEN
        ALTER TABLE public.appointments ADD COLUMN patient_email VARCHAR(255);
        COMMENT ON COLUMN public.appointments.patient_email IS 'For easy querying without joins';
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON public.appointments(patient_email);
        
        RAISE NOTICE 'patient_email column added to appointments table';
    ELSE
        RAISE NOTICE 'patient_email column already exists in appointments table';
    END IF;
END $$;

-- Update existing appointments to populate patient_email from patients table
UPDATE public.appointments 
SET patient_email = patients.email 
FROM public.patients 
WHERE appointments.patient_id = patients.id 
AND appointments.patient_email IS NULL;

-- Make patient_email NOT NULL after populating existing data
ALTER TABLE public.appointments 
ALTER COLUMN patient_email SET NOT NULL;

-- Verify the fix
SELECT 
    COUNT(*) as total_appointments,
    COUNT(patient_email) as appointments_with_email
FROM public.appointments;
