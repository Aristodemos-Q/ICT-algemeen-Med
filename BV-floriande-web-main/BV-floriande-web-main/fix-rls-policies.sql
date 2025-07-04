-- Fix RLS policies to allow proper CRUD operations
-- This script fixes the infinite recursion issues in Row Level Security policies

-- Step 1: Disable RLS temporarily on all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_trainers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_trainers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_exercises DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage user profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.users;
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can manage groups" ON public.groups;
DROP POLICY IF EXISTS "Creators and admins can manage groups" ON public.groups;
DROP POLICY IF EXISTS "Admins or group creators can manage groups" ON public.groups;
DROP POLICY IF EXISTS "Anyone can view members" ON public.members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
DROP POLICY IF EXISTS "Anyone can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can manage group members" ON public.group_members;
DROP POLICY IF EXISTS "Anyone can view group trainers" ON public.group_trainers;
DROP POLICY IF EXISTS "Admins can manage group trainers" ON public.group_trainers;
DROP POLICY IF EXISTS "Anyone can view locations" ON public.locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON public.locations;
DROP POLICY IF EXISTS "Anyone can view exercises" ON public.exercises;
DROP POLICY IF EXISTS "Trainers and admins can manage exercises" ON public.exercises;
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.sessions;
DROP POLICY IF EXISTS "Trainers and admins can manage sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anyone can view session trainers" ON public.session_trainers;
DROP POLICY IF EXISTS "Trainers and admins can manage session trainers" ON public.session_trainers;
DROP POLICY IF EXISTS "Anyone can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Trainers and admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Anyone can view completed exercises" ON public.completed_exercises;
DROP POLICY IF EXISTS "Trainers and admins can manage completed exercises" ON public.completed_exercises;

-- Step 3: Create safe admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role')::text = 'admin'
  );
$$;

-- Step 4: Create simple RLS policies for authenticated users
-- Simple policies: Authenticated users can do everything
-- This prevents RLS infinite recursion while still providing basic auth

-- Users policies
CREATE POLICY "authenticated_users_can_view_users" ON public.users 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_manage_users" ON public.users 
  FOR ALL USING (auth.role() = 'authenticated');

-- Groups policies
CREATE POLICY "authenticated_users_can_view_groups" ON public.groups 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_manage_groups" ON public.groups 
  FOR ALL USING (auth.role() = 'authenticated');

-- Members policies
CREATE POLICY "authenticated_users_can_view_members" ON public.members 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_manage_members" ON public.members 
  FOR ALL USING (auth.role() = 'authenticated');

-- Group members policies
CREATE POLICY "authenticated_users_can_view_group_members" ON public.group_members 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_manage_group_members" ON public.group_members 
  FOR ALL USING (auth.role() = 'authenticated');

-- Group trainers policies
CREATE POLICY "authenticated_users_can_view_group_trainers" ON public.group_trainers 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_manage_group_trainers" ON public.group_trainers 
  FOR ALL USING (auth.role() = 'authenticated');

-- Locations policies
CREATE POLICY "authenticated_users_can_view_locations" ON public.locations 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_manage_locations" ON public.locations 
  FOR ALL USING (auth.role() = 'authenticated');

-- Exercises policies
CREATE POLICY "authenticated_users_can_view_exercises" ON public.exercises 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_manage_exercises" ON public.exercises 
  FOR ALL USING (auth.role() = 'authenticated');

-- Sessions policies
CREATE POLICY "authenticated_users_can_view_sessions" ON public.sessions 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_manage_sessions" ON public.sessions 
  FOR ALL USING (auth.role() = 'authenticated');

-- Session trainers policies
CREATE POLICY "authenticated_users_can_view_session_trainers" ON public.session_trainers 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_manage_session_trainers" ON public.session_trainers 
  FOR ALL USING (auth.role() = 'authenticated');

-- Attendance policies
CREATE POLICY "authenticated_users_can_view_attendance" ON public.attendance 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_manage_attendance" ON public.attendance 
  FOR ALL USING (auth.role() = 'authenticated');

-- Completed exercises policies
CREATE POLICY "authenticated_users_can_view_completed_exercises" ON public.completed_exercises 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_manage_completed_exercises" ON public.completed_exercises 
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 5: Re-enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_exercises ENABLE ROW LEVEL SECURITY;

-- Step 6: Grant function permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies fixed successfully!';
  RAISE NOTICE '🎉 You can now create groups, sessions, members, and training sessions!';
  RAISE NOTICE '🔧 Database is ready for full CRUD operations!';
END;
$$;
