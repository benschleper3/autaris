-- Fix remaining functions with search path security issues
-- Update all existing functions to have proper search_path settings

CREATE OR REPLACE FUNCTION public.update_user_meta_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_creator_kpis()
RETURNS TABLE(leads_7d bigint, calls_7d bigint, clients_30d bigint, revenue_30d numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.set_user_role(p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN 
    RAISE EXCEPTION 'Not authenticated'; 
  END IF;
  
  IF p_role NOT IN ('creator','ugc_creator') THEN 
    RAISE EXCEPTION 'Invalid role'; 
  END IF;
  
  INSERT INTO public.user_meta(user_id, role)
  VALUES (auth.uid(), p_role)
  ON CONFLICT (user_id) DO UPDATE SET role = excluded.role;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_ugc_kpis()
RETURNS TABLE(views_30d bigint, avg_er_30d numeric, posts_30d bigint, active_campaigns bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  select * from public.get_ugc_kpis(
    (current_date - interval '30 days')::date,
    current_date::date,
    'all'::text
  );
$function$;

CREATE OR REPLACE FUNCTION public.run_user_kpis(p_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  with kpis as (
    select * from public.get_ugc_kpis((current_date - interval '30 days')::date, current_date::date, 'all')
  ),
  top as (
    select post_id, title, platform, views, engagement_rate
    from public.v_posts_with_latest
    where user_id = p_user_id
    order by engagement_rate desc nulls last, views desc nulls last
    limit 10
  )
  select json_build_object(
    'user_id', p_user_id,
    'kpis', (select row_to_json(k) from kpis k),
    'top_posts', (select json_agg(t) from top t)
  );
$function$;