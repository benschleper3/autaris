-- Create the get_ugc_kpis function
CREATE OR REPLACE FUNCTION public.get_ugc_kpis()
RETURNS TABLE(
  views_30d bigint,
  avg_er_30d numeric,
  posts_30d bigint,
  active_campaigns bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT * FROM public.v_posts_with_latest
    WHERE user_id = auth.uid()
      AND coalesce(published_at, created_at) >= now() - interval '30 days'
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
$$;