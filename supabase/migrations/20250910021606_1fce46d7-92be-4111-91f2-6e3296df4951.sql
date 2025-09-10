-- Fix get_ugc_kpis to avoid round(double precision, integer) and ensure numeric rounding
CREATE OR REPLACE FUNCTION public.get_ugc_kpis()
RETURNS TABLE(views_30d bigint, avg_er_30d numeric, posts_30d bigint, active_campaigns bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT * FROM public.v_posts_with_latest
    WHERE user_id = auth.uid()
      AND coalesce(published_at, created_at) >= now() - interval '30 days'
  ),
  views30 AS (SELECT coalesce(sum(views),0) v FROM base),
  er30 AS (SELECT round(AVG(engagement_rate)::numeric, 2) e FROM base),
  posts30 AS (SELECT count(*) c FROM base),
  camps AS (
    SELECT count(*) c
    FROM public.campaigns
    WHERE user_id = auth.uid()
      AND (start_date IS NULL OR start_date <= current_date)
      AND (end_date IS NULL OR end_date >= current_date)
  )
  SELECT 
    (SELECT v FROM views30) as views_30d,
    (SELECT e FROM er30) as avg_er_30d,
    (SELECT c FROM posts30) as posts_30d,
    (SELECT c FROM camps) as active_campaigns;
END;
$function$;

-- Recreate v_daily_perf to include day_views series
CREATE OR REPLACE VIEW public.v_daily_perf AS
SELECT
  p.user_id,
  date_trunc('day', coalesce(p.published_at, p.created_at))::date AS day,
  SUM(coalesce(v.views,0)) AS day_views,
  AVG(
    CASE WHEN coalesce(v.views,0) = 0 THEN 0
         ELSE (coalesce(v.likes,0)+coalesce(v.comments,0)+coalesce(v.saves,0)+coalesce(v.shares,0)) / NULLIF(v.views,0)
    END
  ) * 100::numeric AS avg_er_percent
FROM public.posts p
LEFT JOIN public.v_post_latest v ON v.post_id = p.id
GROUP BY 1,2;