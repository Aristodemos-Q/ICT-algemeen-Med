-- Temporary: Disable RLS for testing Firebase hosting
-- Run this in Supabase SQL Editor to allow anonymous access

-- Disable RLS for appointment requests (needed for booking form)
ALTER TABLE appointment_requests DISABLE ROW LEVEL SECURITY;

-- Disable RLS for other tables needed for the app
ALTER TABLE appointment_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE practice_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Optional: Add some feedback
SELECT 'RLS disabled for Firebase hosting compatibility' as status;
