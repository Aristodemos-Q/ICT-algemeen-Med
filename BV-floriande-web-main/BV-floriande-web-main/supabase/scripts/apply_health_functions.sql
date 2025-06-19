-- Combined script with all health check functions

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS public.get_service_status() CASCADE;
DROP FUNCTION IF EXISTS public.ping() CASCADE;

-- Create a function to check if the database is functioning
CREATE OR REPLACE FUNCTION public.get_service_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function returns JSON with status information
  RETURN jsonb_build_object(
    'status', 'healthy',
    'timestamp', NOW()::text,
    'message', 'Database is functioning normally'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'timestamp', NOW()::text,
      'message', SQLERRM
    );
END;
$$;

-- Grant access to the anonymous role
GRANT EXECUTE ON FUNCTION public.get_service_status() TO anon;
GRANT EXECUTE ON FUNCTION public.get_service_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_service_status() TO service_role;

-- Create a simple ping function for basic health checks
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

-- Grant access to all roles
GRANT EXECUTE ON FUNCTION public.ping() TO anon;
GRANT EXECUTE ON FUNCTION public.ping() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ping() TO service_role;
