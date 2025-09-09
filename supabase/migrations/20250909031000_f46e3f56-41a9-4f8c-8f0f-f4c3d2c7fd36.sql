-- Create missing database functions and fix views

-- Create the get_creator_kpis function
CREATE OR REPLACE FUNCTION get_creator_kpis()
RETURNS TABLE (
  leads_7d bigint,
  calls_7d bigint, 
  clients_30d bigint,
  revenue_30d numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH leads7 AS (
    SELECT count(*) c FROM public.crm_leads 
    WHERE user_id = auth.uid() AND created_at >= now() - interval '7 days'
  ),
  calls7 AS (
    SELECT count(*) c FROM public.crm_bookings 
    WHERE user_id = auth.uid() AND starts_at >= now() - interval '7 days'
  ),
  clients30 AS (
    SELECT count(*) c FROM public.crm_opportunities 
    WHERE user_id = auth.uid() AND won = true AND close_date >= current_date - interval '30 days'
  ),
  rev30 AS (
    SELECT coalesce(sum(value_cents), 0) / 100.0 amt FROM public.crm_opportunities 
    WHERE user_id = auth.uid() AND won = true AND close_date >= current_date - interval '30 days'
  )
  SELECT 
    (SELECT c FROM leads7) as leads_7d,
    (SELECT c FROM calls7) as calls_7d,
    (SELECT c FROM clients30) as clients_30d,
    (SELECT amt FROM rev30) as revenue_30d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the v_posts_with_latest view that was referenced but missing
CREATE OR REPLACE VIEW public.v_posts_with_latest AS
SELECT 
  pm.user_id,
  pm.post_id,
  pm.title,
  sa.platform,
  pm.published_at,
  pm.created_at,
  pm.views,
  pm.likes,
  pm.comments,
  pm.shares,
  pm.engagement_rate,
  pm.url
FROM public.post_metrics pm
LEFT JOIN public.social_accounts sa ON sa.user_id = pm.user_id;

-- Set security_invoker = true on the new view
ALTER VIEW public.v_posts_with_latest SET (security_invoker = true);