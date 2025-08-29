
-- MedCheck+ RLS Policies Setup
-- This script sets up Row Level Security policies for Firebase hosting compatibility

-- Appointment Requests
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert appointment requests" ON appointment_requests;
DROP POLICY IF EXISTS "Everyone can read appointment requests" ON appointment_requests;
DROP POLICY IF EXISTS "Staff can update appointment requests" ON appointment_requests;

CREATE POLICY "Anyone can insert appointment requests" 
ON appointment_requests FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Everyone can read appointment requests" 
ON appointment_requests FOR SELECT 
USING (true);

CREATE POLICY "Staff can update appointment requests" 
ON appointment_requests FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Practice Locations
ALTER TABLE practice_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read practice locations" ON practice_locations;

CREATE POLICY "Everyone can read practice locations" 
ON practice_locations FOR SELECT 
USING (true);

-- Appointment Types
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read appointment types" ON appointment_types;

CREATE POLICY "Everyone can read appointment types" 
ON appointment_types FOR SELECT 
USING (true);

-- Appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read appointments" ON appointments;
DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;

CREATE POLICY "Everyone can read appointments" 
ON appointments FOR SELECT 
USING (true);

CREATE POLICY "Staff can manage appointments" 
ON appointments FOR ALL 
USING (true) 
WITH CHECK (true);
