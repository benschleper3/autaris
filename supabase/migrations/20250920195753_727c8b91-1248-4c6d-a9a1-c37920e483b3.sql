-- Fix security definer views by recreating only the actual views with proper security context
-- The issue is that views created by postgres run with superuser privileges (SECURITY DEFINER)
-- We need to recreate them as SECURITY INVOKER so RLS policies are respected

-- Fix public.profiles view (this references app.profiles)
DROP VIEW IF EXISTS public.profiles CASCADE;
CREATE VIEW public.profiles 
WITH (security_invoker = true)
AS 
SELECT user_id, full_name, plan, timezone, avatar_url, phone, metadata, 
       onboarded_at, last_login_at, created_at, updated_at
FROM app.profiles;

-- Grant appropriate permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- The other views (v_daily_perf, v_post_latest, v_posts_with_latest, v_time_heatmap) 
-- don't reference app schema directly, but let's fix them to be explicit about security_invoker
DROP VIEW IF EXISTS public.v_daily_perf CASCADE;
CREATE VIEW public.v_daily_perf
WITH (security_invoker = true)
AS 
SELECT p.user_id,
    (date_trunc('day'::text, COALESCE(p.published_at, p.created_at)))::date AS day,
    sum(COALESCE(v.views, 0)) AS day_views,
    (avg(
        CASE
            WHEN (COALESCE(v.views, 0) = 0) THEN 0
            ELSE ((((COALESCE(v.likes, 0) + COALESCE(v.comments, 0)) + COALESCE(v.saves, 0)) + COALESCE(v.shares, 0)) / NULLIF(v.views, 0))
        END) * (100)::numeric) AS avg_er_percent
FROM (posts p LEFT JOIN v_post_latest v ON ((v.post_id = p.id)))
GROUP BY p.user_id, ((date_trunc('day'::text, COALESCE(p.published_at, p.created_at)))::date);

GRANT SELECT ON public.v_daily_perf TO authenticated;