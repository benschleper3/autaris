-- Helper views for UGC analytics dashboard

-- Create v_post_latest view
CREATE OR REPLACE VIEW public.v_post_latest AS
SELECT DISTINCT ON (pm.post_id)
  pm.post_id, pm.updated_at as captured_at, pm.views, pm.likes, pm.comments, pm.shares
FROM public.post_metrics pm
ORDER BY pm.post_id, pm.updated_at DESC;

-- Recreate v_posts_with_latest to work with existing schema
CREATE OR REPLACE VIEW public.v_posts_with_latest AS
SELECT
  pm.post_id, pm.user_id, pm.title, pm.url,
  pm.published_at, pm.created_at,
  sa.platform,
  COALESCE(pm.views,0) as views,
  COALESCE(pm.likes,0) as likes,
  COALESCE(pm.comments,0) as comments,
  COALESCE(pm.shares,0) as shares,
  CASE WHEN COALESCE(pm.views,0)=0 THEN 0
       ELSE ROUND(100.0*(COALESCE(pm.likes,0)+COALESCE(pm.comments,0)+COALESCE(pm.shares,0)) / NULLIF(pm.views,0), 2)
  END as engagement_rate
FROM public.post_metrics pm
LEFT JOIN public.social_accounts sa ON sa.id = pm.social_account_id AND sa.user_id = pm.user_id;

-- Create v_daily_perf view
CREATE OR REPLACE VIEW public.v_daily_perf AS
SELECT
  pm.user_id,
  DATE_TRUNC('day', COALESCE(pm.published_at, pm.created_at))::date as day,
  SUM(COALESCE(pm.views,0)) as day_views,
  ROUND(AVG(CASE WHEN COALESCE(pm.views,0)=0 THEN 0
           ELSE (COALESCE(pm.likes,0)+COALESCE(pm.comments,0)+COALESCE(pm.shares,0)) / NULLIF(pm.views,0) * 100 END), 2)
  as avg_er_percent
FROM public.post_metrics pm
GROUP BY 1,2;

-- Create v_campaign_rollup view
CREATE OR REPLACE VIEW public.v_campaign_rollup AS
SELECT
  c.user_id, c.id as campaign_id, c.brand_name, c.campaign_name as title,
  0 as total_views, -- Will be populated by actual post data
  0 as deliverables_count,
  0 as approved_count,
  0 as avg_engagement_rate
FROM public.campaigns c;

-- Create posts table if it doesn't exist (for the views to work)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  caption TEXT,
  asset_url TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  social_account_id BIGINT,
  campaign_id UUID
);

-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policy for posts
CREATE POLICY "Users can manage their own posts" 
ON public.posts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);