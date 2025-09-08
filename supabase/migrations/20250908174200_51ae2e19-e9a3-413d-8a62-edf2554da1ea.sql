-- Fix security definer views by recreating them without SECURITY DEFINER
-- This ensures RLS policies are enforced when accessing data through the public views

DROP VIEW IF EXISTS public.profiles;
DROP VIEW IF EXISTS public.social_accounts;
DROP VIEW IF EXISTS public.post_metrics;
DROP VIEW IF EXISTS public.weekly_insights;

-- Recreate views without SECURITY DEFINER to enforce RLS
CREATE VIEW public.profiles AS 
SELECT * FROM app.profiles;

CREATE VIEW public.social_accounts AS 
SELECT * FROM app.social_accounts;

CREATE VIEW public.post_metrics AS 
SELECT * FROM app.post_metrics;

CREATE VIEW public.weekly_insights AS 
SELECT * FROM app.weekly_insights;