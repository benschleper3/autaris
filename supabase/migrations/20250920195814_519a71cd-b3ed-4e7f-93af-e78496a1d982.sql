-- Fix the remaining security definer views
-- Recreate all remaining views with explicit security_invoker = true

-- Fix v_post_latest view
DROP VIEW IF EXISTS public.v_post_latest CASCADE;
CREATE VIEW public.v_post_latest
WITH (security_invoker = true)
AS 
SELECT DISTINCT ON (post_id) post_id,
    captured_at,
    views,
    likes,
    comments,
    saves,
    shares
FROM post_metrics pm
ORDER BY post_id, captured_at DESC;

GRANT SELECT ON public.v_post_latest TO authenticated;

-- Fix v_posts_with_latest view  
DROP VIEW IF EXISTS public.v_posts_with_latest CASCADE;
CREATE VIEW public.v_posts_with_latest
WITH (security_invoker = true)
AS 
SELECT p.id AS post_id,
    p.user_id,
    p.title,
    p.caption,
    p.asset_url,
    p.asset_url AS url,
    p.status,
    p.scheduled_at,
    p.published_at,
    p.created_at,
    sa.platform,
    COALESCE(v.views, 0) AS views,
    COALESCE(v.likes, 0) AS likes,
    COALESCE(v.comments, 0) AS comments,
    COALESCE(v.saves, 0) AS saves,
    COALESCE(v.shares, 0) AS shares,
    CASE
        WHEN (COALESCE(v.views, 0) = 0) THEN (0)::numeric
        ELSE round(((100.0 * ((((COALESCE(v.likes, 0) + COALESCE(v.comments, 0)) + COALESCE(v.saves, 0)) + COALESCE(v.shares, 0)))::numeric) / (NULLIF(v.views, 0))::numeric), 2)
    END AS engagement_rate
FROM ((posts p
  LEFT JOIN v_post_latest v ON ((v.post_id = p.id)))
  LEFT JOIN social_accounts sa ON (((sa.id = p.social_account_id) AND (sa.user_id = p.user_id))));

GRANT SELECT ON public.v_posts_with_latest TO authenticated;