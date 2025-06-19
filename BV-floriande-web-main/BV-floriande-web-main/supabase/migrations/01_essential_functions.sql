-- =======================================
-- MEDCHECK+ ESSENTIAL FUNCTIONS FIRST
-- =======================================

-- Create exec_sql function first (needed for other scripts)
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Create ping function for connectivity tests
CREATE OR REPLACE FUNCTION public.ping()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'message', 'pong',
    'timestamp', NOW()::text
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.ping() TO authenticated, anon, service_role;

COMMENT ON FUNCTION public.exec_sql IS 'Execute dynamic SQL - for admin operations only';
COMMENT ON FUNCTION public.ping IS 'Health check function for testing connectivity';
