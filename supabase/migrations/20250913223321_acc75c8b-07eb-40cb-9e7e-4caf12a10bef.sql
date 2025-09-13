-- Create improved UGC KPIs function with date and platform filtering
CREATE OR REPLACE FUNCTION public.get_ugc_kpis(
  p_from date DEFAULT current_date - interval '30 days',
  p_to date DEFAULT current_date,
  p_platform text DEFAULT 'all'
)
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
      AND (p_platform = 'all' OR platform::text = p_platform)
      AND ((p_from IS NULL AND p_to IS NULL) 
           OR coalesce(published_at, created_at) BETWEEN p_from AND p_to)
  ),
  views30 AS (SELECT coalesce(sum(views),0) v FROM base),
  er30 AS (SELECT round(avg(engagement_rate),2) e FROM base),
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

-- Create daily performance function with date and platform filtering
CREATE OR REPLACE FUNCTION public.get_daily_perf(
  p_from date DEFAULT current_date - interval '30 days',
  p_to date DEFAULT current_date,
  p_platform text DEFAULT 'all'
)
RETURNS TABLE(day date, day_views bigint, avg_er_percent numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH filtered_posts AS (
    SELECT * FROM public.v_posts_with_latest
    WHERE user_id = auth.uid()
      AND (p_platform = 'all' OR platform::text = p_platform)
      AND ((p_from IS NULL AND p_to IS NULL) 
           OR coalesce(published_at, created_at) BETWEEN p_from AND p_to)
  ),
  daily_perf AS (
    SELECT 
      coalesce(published_at, created_at)::date as day,
      sum(views) as day_views,
      round(avg(engagement_rate), 2) as avg_er_percent
    FROM filtered_posts
    GROUP BY coalesce(published_at, created_at)::date
  )
  SELECT * FROM daily_perf
  ORDER BY day;
END;
$function$;