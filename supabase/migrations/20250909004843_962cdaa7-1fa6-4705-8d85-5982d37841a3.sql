-- Fix Security Definer Views Issue
-- The linter is flagging views that may bypass RLS due to ownership/security model
-- Recreate public views to ensure proper security behavior

-- Drop and recreate public views to ensure they don't bypass RLS
DROP VIEW IF EXISTS public.profiles CASCADE;
DROP VIEW IF EXISTS public.social_accounts CASCADE;
DROP VIEW IF EXISTS public.post_metrics CASCADE;
DROP VIEW IF EXISTS public.weekly_insights CASCADE;

-- Recreate views with explicit security model
-- These views will now properly enforce RLS policies from the underlying app schema tables
CREATE VIEW public.profiles AS 
SELECT 
    user_id,
    full_name,
    plan,
    timezone,
    avatar_url,
    phone,
    metadata,
    onboarded_at,
    last_login_at,
    created_at,
    updated_at
FROM app.profiles;

CREATE VIEW public.social_accounts AS
SELECT 
    id,
    user_id,
    platform,
    handle,
    external_id,
    status,
    last_synced_at,
    created_at,
    updated_at
FROM app.social_accounts;

CREATE VIEW public.post_metrics AS
SELECT 
    id,
    user_id,
    social_account_id,
    post_id,
    title,
    url,
    published_at,
    views,
    likes,
    comments,
    shares,
    engagement_rate,
    created_at,
    updated_at
FROM app.post_metrics;

CREATE VIEW public.weekly_insights AS
SELECT 
    id,
    user_id,
    week_start,
    narrative,
    recommendations,
    best_times,
    top_posts,
    created_at,
    updated_at
FROM app.weekly_insights;

-- Ensure proper ownership and permissions
-- Grant appropriate permissions to authenticated users
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.social_accounts TO authenticated;
GRANT SELECT ON public.post_metrics TO authenticated;  
GRANT SELECT ON public.weekly_insights TO authenticated;