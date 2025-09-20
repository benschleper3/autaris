-- Fix the last remaining view - v_time_heatmap
DROP VIEW IF EXISTS public.v_time_heatmap CASCADE;
CREATE VIEW public.v_time_heatmap
WITH (security_invoker = true)
AS 
WITH base AS (
    SELECT p.user_id,
        sa.platform,
        (EXTRACT(dow FROM COALESCE(p.published_at, p.created_at)))::integer AS dow,
        (EXTRACT(hour FROM COALESCE(p.published_at, p.created_at)))::integer AS hour,
        v.views,
        v.likes,
        v.comments,
        v.saves,
        v.shares
    FROM ((posts p
      LEFT JOIN v_post_latest v ON ((v.post_id = p.id)))
      LEFT JOIN social_accounts sa ON (((sa.id = p.social_account_id) AND (sa.user_id = p.user_id))))
    WHERE (COALESCE(p.published_at, p.created_at) >= (now() - '90 days'::interval))
)
SELECT user_id,
    platform,
    dow,
    hour,
    round(((100.0 * avg((((COALESCE(likes, 0) + COALESCE(comments, 0)) + COALESCE(saves, 0)) + COALESCE(shares, 0)))) / NULLIF(avg(NULLIF(views, 0)), (0)::numeric)), 2) AS avg_engagement_percent,
    count(*) AS posts_count
FROM base
GROUP BY user_id, platform, dow, hour;

GRANT SELECT ON public.v_time_heatmap TO authenticated;