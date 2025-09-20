-- Fix security definer views by recreating them with proper security context
-- The issue is that views created by postgres run with superuser privileges
-- We need to recreate them as SECURITY INVOKER (default) and ensure proper permissions

-- Drop and recreate the public.profiles view to remove implicit SECURITY DEFINER behavior
DROP VIEW IF EXISTS public.profiles CASCADE;

-- Recreate without SECURITY DEFINER - this will use SECURITY INVOKER by default
-- which means RLS policies of the querying user will be respected
CREATE VIEW public.profiles 
WITH (security_invoker = true)
AS 
SELECT user_id, full_name, plan, timezone, avatar_url, phone, metadata, 
       onboarded_at, last_login_at, created_at, updated_at
FROM app.profiles;

-- Grant appropriate permissions to the view
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Also fix other public views that might have the same issue
DROP VIEW IF EXISTS public.social_accounts CASCADE;
CREATE VIEW public.social_accounts 
WITH (security_invoker = true)
AS 
SELECT * FROM app.social_accounts;

GRANT SELECT ON public.social_accounts TO authenticated;
GRANT SELECT ON public.social_accounts TO anon;

DROP VIEW IF EXISTS public.post_metrics CASCADE;
CREATE VIEW public.post_metrics 
WITH (security_invoker = true)
AS 
SELECT * FROM app.post_metrics;

GRANT SELECT ON public.post_metrics TO authenticated;

DROP VIEW IF EXISTS public.weekly_insights CASCADE;
CREATE VIEW public.weekly_insights 
WITH (security_invoker = true)
AS 
SELECT * FROM app.weekly_insights;

GRANT SELECT ON public.weekly_insights TO authenticated;