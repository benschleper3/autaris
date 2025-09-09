-- Fix Security Definer Views by setting security_invoker = true
-- This ensures views use the permissions of the querying user, not the view creator
-- Reference: https://github.com/orgs/supabase/discussions/28464

-- Set security_invoker = true on all public views to fix the linter warnings
ALTER VIEW public.profiles SET (security_invoker = true);
ALTER VIEW public.social_accounts SET (security_invoker = true);
ALTER VIEW public.post_metrics SET (security_invoker = true);
ALTER VIEW public.weekly_insights SET (security_invoker = true);