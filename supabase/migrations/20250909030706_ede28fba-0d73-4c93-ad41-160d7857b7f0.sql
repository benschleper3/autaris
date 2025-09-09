-- Creator vs UGC Creator Business OS Database Schema (Fixed JOIN issues)

-- User metadata table for role storage
CREATE TABLE IF NOT EXISTS public.user_meta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  role TEXT CHECK (role IN ('creator', 'ugc_creator')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CRM tables for Creator dashboard
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT,
  email TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  value_cents BIGINT DEFAULT 0,
  stage TEXT CHECK (stage IN ('new', 'qualified', 'call_booked', 'proposal', 'won', 'lost')) DEFAULT 'new',
  won BOOLEAN DEFAULT false,
  close_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Campaign tables for UGC Creator dashboard  
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  brand_name TEXT,
  start_date DATE,
  end_date DATE,
  budget_cents BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id),
  title TEXT NOT NULL,
  stage TEXT CHECK (stage IN ('script', 'first_cut', 'final', 'submitted', 'approved', 'paid')) DEFAULT 'script',
  due_date DATE,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.creator_revenue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_name TEXT,
  amount_cents BIGINT NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Link hub tables
CREATE TABLE IF NOT EXISTS public.link_hub_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.link_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  link_id UUID REFERENCES public.link_hub_links(id),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Portfolio items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  post_id TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Report links table
CREATE TABLE IF NOT EXISTS public.report_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  report_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_hub_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_links ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own meta" ON public.user_meta
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own leads" ON public.crm_leads
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookings" ON public.crm_bookings
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own opportunities" ON public.crm_opportunities
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own campaigns" ON public.campaigns
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own deliverables" ON public.deliverables
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own revenue" ON public.creator_revenue
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own links" ON public.link_hub_links
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own clicks" ON public.link_clicks
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own portfolio" ON public.portfolio_items
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reports" ON public.report_links
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Fixed views with proper table joins
CREATE OR REPLACE VIEW public.v_post_attribution AS
SELECT 
  pm.user_id,
  pm.post_id,
  COUNT(cl.id) as leads_count,
  COALESCE(SUM(co.value_cents), 0) / 100.0 as revenue_usd
FROM public.post_metrics pm
LEFT JOIN public.crm_leads cl ON cl.user_id = pm.user_id
LEFT JOIN public.crm_opportunities co ON co.user_id = pm.user_id AND co.won = true
GROUP BY pm.user_id, pm.post_id;

CREATE OR REPLACE VIEW public.v_campaign_rollup AS
SELECT 
  c.id,
  c.user_id,
  c.title,
  c.brand_name,
  COALESCE(SUM(pm.views), 0) as total_views,
  ROUND(AVG(pm.engagement_rate)::numeric, 2) as avg_engagement_rate,
  COUNT(d.id) as deliverables_count,
  COUNT(CASE WHEN d.approved THEN 1 END) as approved_count
FROM public.campaigns c
LEFT JOIN public.deliverables d ON d.campaign_id = c.id
LEFT JOIN public.post_metrics pm ON pm.user_id = c.user_id
GROUP BY c.id, c.user_id, c.title, c.brand_name;

CREATE OR REPLACE VIEW public.v_daily_perf AS
SELECT 
  user_id,
  DATE(created_at) as day,
  ROUND(AVG(engagement_rate)::numeric, 2) as avg_er_percent
FROM public.post_metrics
GROUP BY user_id, DATE(created_at)
ORDER BY day;

-- Fixed time heatmap with proper join to social_accounts for platform
CREATE OR REPLACE VIEW public.v_time_heatmap AS
SELECT 
  pm.user_id,
  sa.platform,
  EXTRACT(DOW FROM pm.published_at) as dow,
  EXTRACT(HOUR FROM pm.published_at) as hour,
  ROUND(AVG(pm.engagement_rate)::numeric, 2) as avg_engagement_percent
FROM public.post_metrics pm
LEFT JOIN public.social_accounts sa ON sa.user_id = pm.user_id
WHERE pm.published_at IS NOT NULL
GROUP BY pm.user_id, sa.platform, EXTRACT(DOW FROM pm.published_at), EXTRACT(HOUR FROM pm.published_at);

-- Fixed pricing suggestions with proper join to social_accounts for platform
CREATE OR REPLACE VIEW public.v_pricing_suggestions AS
SELECT 
  pm.user_id,
  sa.platform,
  ROUND(AVG(pm.views)::numeric) as avg_views_30d,
  CASE 
    WHEN sa.platform = 'instagram' THEN 8.0
    WHEN sa.platform = 'tiktok' THEN 6.0
    WHEN sa.platform = 'youtube' THEN 12.0
    ELSE 7.0
  END as suggested_cpm_usd
FROM public.post_metrics pm
LEFT JOIN public.social_accounts sa ON sa.user_id = pm.user_id
WHERE pm.created_at >= now() - interval '30 days'
GROUP BY pm.user_id, sa.platform;

-- Set security_invoker = true on all views
ALTER VIEW public.v_post_attribution SET (security_invoker = true);
ALTER VIEW public.v_campaign_rollup SET (security_invoker = true);
ALTER VIEW public.v_daily_perf SET (security_invoker = true);
ALTER VIEW public.v_time_heatmap SET (security_invoker = true);
ALTER VIEW public.v_pricing_suggestions SET (security_invoker = true);

-- Create update trigger for user_meta
CREATE OR REPLACE FUNCTION public.update_user_meta_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_meta_updated_at
  BEFORE UPDATE ON public.user_meta
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_meta_updated_at();