-- Ensure the role RPC exists
CREATE OR REPLACE FUNCTION public.set_user_role(p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_role NOT IN ('creator','ugc_creator') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  INSERT INTO public.user_meta(user_id, role)
  VALUES (auth.uid(), p_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
END $$;

GRANT EXECUTE ON FUNCTION public.set_user_role(text) TO anon, authenticated;

-- Add missing tables if they don't exist
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text,
  caption text,
  asset_url text,
  status text DEFAULT 'published',
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  social_account_id bigint
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own posts" ON public.posts
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Update campaigns table to include campaign_name if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'campaign_name') THEN
    ALTER TABLE public.campaigns ADD COLUMN campaign_name text;
  END IF;
END $$;

-- Add posts campaign_id reference if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'campaign_id') THEN
    ALTER TABLE public.posts ADD COLUMN campaign_id uuid;
  END IF;
END $$;

-- Add portfolio_items position column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'portfolio_items' AND column_name = 'position') THEN
    ALTER TABLE public.portfolio_items ADD COLUMN position integer;
  END IF;
END $$;

-- Update portfolio_items to add highlight column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'portfolio_items' AND column_name = 'highlight') THEN
    ALTER TABLE public.portfolio_items ADD COLUMN highlight boolean DEFAULT false;
  END IF;
END $$;

-- Add report_links table
CREATE TABLE IF NOT EXISTS public.report_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  campaign_id uuid,
  from_date date,
  to_date date,
  url text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.report_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own report links" ON public.report_links
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Required helper views (create/replace safely)
CREATE OR REPLACE VIEW public.v_post_latest AS
SELECT DISTINCT ON (pm.post_id)
  pm.post_id, pm.created_at as captured_at, pm.views, pm.likes, pm.comments, pm.shares
FROM public.post_metrics pm
ORDER BY pm.post_id, pm.created_at DESC;

CREATE OR REPLACE VIEW public.v_posts_with_latest AS
SELECT
  COALESCE(p.post_id, pm.post_id) as post_id, 
  COALESCE(p.user_id, pm.user_id) as user_id, 
  COALESCE(p.title, pm.title) as title, 
  p.caption, 
  p.asset_url, 
  p.status,
  p.scheduled_at, 
  COALESCE(p.published_at, pm.published_at) as published_at, 
  COALESCE(p.created_at, pm.created_at) as created_at,
  sa.platform,
  COALESCE(v.views, pm.views, 0) as views,
  COALESCE(v.likes, pm.likes, 0) as likes,
  COALESCE(v.comments, pm.comments, 0) as comments,
  COALESCE(v.shares, pm.shares, 0) as shares,
  CASE 
    WHEN COALESCE(v.views, pm.views, 0) = 0 THEN 0
    ELSE ROUND(100.0 * (COALESCE(v.likes, pm.likes, 0) + COALESCE(v.comments, pm.comments, 0) + COALESCE(v.shares, pm.shares, 0)) / NULLIF(COALESCE(v.views, pm.views), 0), 2)
  END as engagement_rate
FROM public.posts p
FULL OUTER JOIN public.post_metrics pm ON pm.post_id = p.id AND pm.user_id = p.user_id
LEFT JOIN public.v_post_latest v ON v.post_id = COALESCE(p.id, pm.post_id)
LEFT JOIN public.social_accounts sa ON sa.id = p.social_account_id AND sa.user_id = COALESCE(p.user_id, pm.user_id)
WHERE COALESCE(p.user_id, pm.user_id) IS NOT NULL;

CREATE OR REPLACE VIEW public.v_daily_perf AS
SELECT
  user_id,
  DATE_TRUNC('day', COALESCE(published_at, created_at))::date as day,
  SUM(COALESCE(views, 0)) as day_views,
  AVG(CASE 
    WHEN COALESCE(views, 0) = 0 THEN 0
    ELSE (COALESCE(likes, 0) + COALESCE(comments, 0) + COALESCE(shares, 0)) / NULLIF(views, 0) 
  END) * 100 as avg_er_percent
FROM public.v_posts_with_latest
GROUP BY user_id, DATE_TRUNC('day', COALESCE(published_at, created_at))::date;

CREATE OR REPLACE VIEW public.v_campaign_rollup AS
SELECT
  c.user_id, c.id, c.brand_name, c.title,
  COALESCE(SUM(v.views), 0) as total_views,
  COALESCE(AVG(v.engagement_rate), 0) as avg_engagement_rate,
  COUNT(DISTINCT v.post_id) as deliverables_count,
  COUNT(DISTINCT CASE WHEN d.approved = true THEN d.id END) as approved_count
FROM public.campaigns c
LEFT JOIN public.v_posts_with_latest v ON c.user_id = v.user_id
LEFT JOIN public.deliverables d ON d.campaign_id = c.id AND d.user_id = c.user_id
WHERE c.user_id IS NOT NULL
GROUP BY c.user_id, c.id, c.brand_name, c.title;

CREATE OR REPLACE VIEW public.v_time_heatmap AS
WITH base AS (
  SELECT 
    user_id, 
    platform,
    EXTRACT(dow FROM COALESCE(published_at, created_at))::int as dow,
    EXTRACT(hour FROM COALESCE(published_at, created_at))::int as hour,
    views, likes, comments, shares
  FROM public.v_posts_with_latest
  WHERE COALESCE(published_at, created_at) >= now() - interval '90 days'
    AND views > 0
)
SELECT 
  user_id, 
  platform, 
  dow, 
  hour,
  ROUND(100.0 * AVG((COALESCE(likes, 0) + COALESCE(comments, 0) + COALESCE(shares, 0)) / NULLIF(views, 0)), 2) as avg_engagement_percent,
  COUNT(*) as posts_count
FROM base
GROUP BY user_id, platform, dow, hour;