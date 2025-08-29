-- Quick fix: Add patient_email column to appointments table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_email VARCHAR(255);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON public.appointments(patient_email);

-- Update existing appointments to populate patient_email from patients table
UPDATE public.appointments 
SET patient_email = patients.email 
FROM public.patients 
WHERE appointments.patient_id = patients.id 
AND appointments.patient_email IS NULL;

-- Verify the fix
SELECT 
    COUNT(*) as total_appointments,
    COUNT(patient_email) as appointments_with_email
FROM public.appointments;
