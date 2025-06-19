-- =======================================
-- BV FLORIANDE CONSOLIDATED SCHEMA
-- =======================================
-- Complete database schema for BV Floriande Trainers Platform
-- Consolidated from working migrations, NO SAMPLE DATA included
-- Date: 2025-06-10
-- Version: Consolidated Clean

-- Set search path
SET search_path TO public, auth, extensions;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- =======================================
-- DROP EXISTING TABLES (clean slate)
-- =======================================
DROP TABLE IF EXISTS public.group_evaluations CASCADE;
DROP TABLE IF EXISTS public.completed_exercises CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.session_trainers CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.group_trainers CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =======================================
-- CORE TABLES
-- =======================================

-- Users table (trainers and admins)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'trainer' CHECK (role IN ('admin', 'trainer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Groups table (training groups)
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    level TEXT,
    age_category TEXT,
    max_members INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT groups_max_members_positive CHECK (max_members > 0)
);

-- Members table (group participants)
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    birth_date DATE,
    contact_info TEXT,
    email TEXT,
    phone TEXT,
    emergency_contact TEXT,
    medical_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Group members junction table
CREATE TABLE public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(group_id, member_id)
);

-- Group trainers junction table
CREATE TABLE public.group_trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    trainer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(group_id, trainer_id)
);

-- Locations table
CREATE TABLE public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    address TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Exercises table
CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Sessions table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    recurrence_type TEXT DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'biweekly', 'monthly')),
    recurrence_end_date DATE,
    parent_session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Session trainers junction table
CREATE TABLE public.session_trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    trainer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(session_id, trainer_id)
);

-- Attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_recorded' CHECK (status IN ('present', 'absent', 'late', 'not_recorded')),
    notes TEXT,
    recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(session_id, member_id)
);

-- Completed exercises table
CREATE TABLE public.completed_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    sets INTEGER,
    reps INTEGER,
    duration_minutes INTEGER,
    notes TEXT,
    recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Group evaluations table
CREATE TABLE public.group_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    evaluation_date DATE DEFAULT CURRENT_DATE NOT NULL,
    strengths TEXT,
    areas_for_improvement TEXT,
    recommended_exercises TEXT[],
    next_goals TEXT,
    notes TEXT,
    evaluator_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =======================================
-- TRIGGERS FOR UPDATED_AT
-- =======================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_trainers_updated_at BEFORE UPDATE ON public.group_trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_completed_exercises_updated_at BEFORE UPDATE ON public.completed_exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_evaluations_updated_at BEFORE UPDATE ON public.group_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================================
-- INDEXES FOR PERFORMANCE
-- =======================================

-- Groups indexes
CREATE INDEX IF NOT EXISTS idx_groups_level ON public.groups(level);
CREATE INDEX IF NOT EXISTS idx_groups_age_category ON public.groups(age_category);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);

-- Group members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_member_id ON public.group_members(member_id);

-- Group trainers indexes
CREATE INDEX IF NOT EXISTS idx_group_trainers_group_id ON public.group_trainers(group_id);
CREATE INDEX IF NOT EXISTS idx_group_trainers_trainer_id ON public.group_trainers(trainer_id);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_group_id ON public.sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON public.sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_location_id ON public.sessions(location_id);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_session_id ON public.attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON public.attendance(member_id);

-- Group evaluations indexes
CREATE INDEX IF NOT EXISTS idx_group_evaluations_group_id ON public.group_evaluations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_evaluations_evaluator_id ON public.group_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_group_evaluations_date ON public.group_evaluations(evaluation_date);

-- =======================================
-- ESSENTIAL FUNCTIONS
-- =======================================

-- Safe admin check function (no RLS recursion)
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

-- Ping function for health checks
CREATE OR REPLACE FUNCTION public.ping()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN jsonb_build_object(
    'message', 'pong',
    'timestamp', NOW()::text
  );
END;
$$;

-- User creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'trainer')
  );
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log error but don't fail the auth user creation
    RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =======================================
-- ROW LEVEL SECURITY POLICIES
-- =======================================

-- Enable RLS on all tables
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
ALTER TABLE public.group_evaluations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.users FOR ALL USING (public.is_admin());

-- Groups policies
CREATE POLICY "Anyone can view groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Admins can manage groups" ON public.groups FOR ALL USING (public.is_admin());

-- Members policies
CREATE POLICY "Anyone can view members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Admins can manage members" ON public.members FOR ALL USING (public.is_admin());

-- Group members policies
CREATE POLICY "Anyone can view group members" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage group members" ON public.group_members FOR ALL USING (public.is_admin());

-- Group trainers policies
CREATE POLICY "Anyone can view group trainers" ON public.group_trainers FOR SELECT USING (true);
CREATE POLICY "Admins can manage group trainers" ON public.group_trainers FOR ALL USING (public.is_admin());

-- Locations policies
CREATE POLICY "Anyone can view locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Admins can manage locations" ON public.locations FOR ALL USING (public.is_admin());

-- Exercises policies
CREATE POLICY "Anyone can view exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Trainers and admins can manage exercises" ON public.exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
);

-- Sessions policies
CREATE POLICY "Anyone can view sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Trainers and admins can manage sessions" ON public.sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
);

-- Session trainers policies
CREATE POLICY "Anyone can view session trainers" ON public.session_trainers FOR SELECT USING (true);
CREATE POLICY "Trainers and admins can manage session trainers" ON public.session_trainers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
);

-- Attendance policies
CREATE POLICY "Anyone can view attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Trainers and admins can manage attendance" ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
);

-- Completed exercises policies
CREATE POLICY "Anyone can view completed exercises" ON public.completed_exercises FOR SELECT USING (true);
CREATE POLICY "Trainers and admins can manage completed exercises" ON public.completed_exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
);

-- Group evaluations policies
CREATE POLICY "Anyone can view group evaluations" ON public.group_evaluations FOR SELECT USING (true);
CREATE POLICY "Trainers and admins can manage group evaluations" ON public.group_evaluations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
);

-- =======================================
-- PERMISSIONS
-- =======================================

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant permissions for service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.ping() TO authenticated, anon, service_role;

-- =======================================
-- COMMENTS FOR DOCUMENTATION
-- =======================================

COMMENT ON TABLE public.users IS 'Trainers and administrators of the platform';
COMMENT ON TABLE public.groups IS 'Training groups (e.g., Groep 1, Groep 2, etc.)';
COMMENT ON TABLE public.members IS 'Members participating in training groups';
COMMENT ON TABLE public.group_members IS 'Junction table linking members to groups';
COMMENT ON TABLE public.group_trainers IS 'Junction table linking trainers to groups';
COMMENT ON TABLE public.locations IS 'Training locations for sessions';
COMMENT ON TABLE public.exercises IS 'Available exercises and drills';
COMMENT ON TABLE public.sessions IS 'Training sessions with schedules';
COMMENT ON TABLE public.session_trainers IS 'Junction table linking trainers to specific sessions';
COMMENT ON TABLE public.attendance IS 'Attendance records for members in sessions';
COMMENT ON TABLE public.completed_exercises IS 'Records of exercises completed by members';
COMMENT ON TABLE public.group_evaluations IS 'Evaluations of group performance and progress';

-- Final status message
DO $$
BEGIN
  RAISE NOTICE '=== BV FLORIANDE SCHEMA SETUP COMPLETE ===';
  RAISE NOTICE 'Database schema has been successfully created';
  RAISE NOTICE 'No sample data included - all data to be added via web interface';
  RAISE NOTICE 'Ready for production use';
END $$;