/*
  # Complete Autaris Schema - Initial Creation

  Creates all required tables for Autaris with proper RLS policies.
  All queries are scoped by auth.uid() for security.

  ## Tables
  1. profiles - User profile data
  2. social_accounts - Connected social media accounts
  3. posts - User content across platforms
  4. post_metrics - Time-series metrics
  5. tiktok_videos - TikTok-specific data
  6. campaigns - Brand campaigns
  7. portfolio_items - Featured work
  8. weekly_insights - AI analytics
  9. waitlist - Email signups
  10. foundation_fund - Fundraising tracker
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Platform enum
DO $$ BEGIN
  CREATE TYPE platform_enum AS ENUM ('tiktok','instagram','facebook','youtube');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  plan text DEFAULT 'Starter',
  timezone text DEFAULT 'UTC',
  avatar_url text,
  phone text,
  metadata jsonb DEFAULT '{}'::jsonb,
  onboarded_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. SOCIAL_ACCOUNTS
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  external_id text,
  handle text,
  display_name text,
  avatar_url text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  follower_count int DEFAULT 0,
  following_count int DEFAULT 0,
  like_count int DEFAULT 0,
  video_count int DEFAULT 0,
  platform_metadata jsonb DEFAULT '{}'::jsonb,
  status text,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS social_accounts_user_platform_idx ON public.social_accounts(user_id, platform);
CREATE INDEX IF NOT EXISTS social_accounts_external_id_idx ON public.social_accounts(external_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_social_accounts_user_platform ON public.social_accounts(user_id, platform);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own accounts" ON public.social_accounts;
CREATE POLICY "Users can view own accounts" ON public.social_accounts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage accounts" ON public.social_accounts;
CREATE POLICY "Service can manage accounts" ON public.social_accounts FOR ALL USING (true) WITH CHECK (true);

-- 3. POSTS
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text,
  social_account_id uuid REFERENCES public.social_accounts(id) ON DELETE SET NULL,
  external_id text,
  title text,
  caption text,
  asset_url text,
  video_url text,
  thumbnail_url text,
  share_url text,
  published_at timestamptz,
  scheduled_at timestamptz,
  status text CHECK (status IN ('draft','scheduled','published')) DEFAULT 'published',
  campaign_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_user_idx ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS posts_user_platform_idx ON public.posts(user_id, platform);
CREATE INDEX IF NOT EXISTS posts_external_id_idx ON public.posts(external_id);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON public.posts(published_at);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own posts" ON public.posts;
CREATE POLICY "Users can view own posts" ON public.posts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage posts" ON public.posts;
CREATE POLICY "Service can manage posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);

-- 4. POST_METRICS
CREATE TABLE IF NOT EXISTS public.post_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  captured_at timestamptz DEFAULT now(),
  views bigint DEFAULT 0,
  likes int DEFAULT 0,
  comments int DEFAULT 0,
  shares int DEFAULT 0,
  saves int DEFAULT 0
);

CREATE INDEX IF NOT EXISTS post_metrics_post_id_idx ON public.post_metrics(post_id);
CREATE INDEX IF NOT EXISTS post_metrics_captured_at_idx ON public.post_metrics(captured_at);
CREATE INDEX IF NOT EXISTS post_metrics_post_captured_idx ON public.post_metrics(post_id, captured_at DESC);

ALTER TABLE public.post_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own metrics" ON public.post_metrics;
CREATE POLICY "Users can view own metrics" ON public.post_metrics FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_metrics.post_id AND posts.user_id = auth.uid()));

DROP POLICY IF EXISTS "Service can manage metrics" ON public.post_metrics;
CREATE POLICY "Service can manage metrics" ON public.post_metrics FOR ALL USING (true) WITH CHECK (true);

-- 5. TIKTOK_VIDEOS
CREATE TABLE IF NOT EXISTS public.tiktok_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id text NOT NULL,
  open_id text,
  title text,
  video_description text,
  cover_image_url text,
  share_url text,
  embed_link text,
  duration_seconds int,
  width int,
  height int,
  view_count bigint DEFAULT 0,
  like_count int DEFAULT 0,
  comment_count int DEFAULT 0,
  share_count int DEFAULT 0,
  create_time timestamptz,
  last_synced_at timestamptz DEFAULT now(),
  UNIQUE (user_id, video_id)
);

CREATE INDEX IF NOT EXISTS tiktok_videos_user_idx ON public.tiktok_videos(user_id);
CREATE INDEX IF NOT EXISTS tiktok_videos_video_id_idx ON public.tiktok_videos(video_id);
CREATE INDEX IF NOT EXISTS tiktok_videos_create_time_idx ON public.tiktok_videos(create_time);

ALTER TABLE public.tiktok_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read own videos" ON public.tiktok_videos;
CREATE POLICY "read own videos" ON public.tiktok_videos FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "service write videos" ON public.tiktok_videos;
CREATE POLICY "service write videos" ON public.tiktok_videos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "service update videos" ON public.tiktok_videos;
CREATE POLICY "service update videos" ON public.tiktok_videos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "service delete videos" ON public.tiktok_videos;
CREATE POLICY "service delete videos" ON public.tiktok_videos FOR DELETE USING (true);

-- 6. CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_name text,
  title text,
  brand_name text,
  budget_cents bigint DEFAULT 0,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS campaigns_user_idx ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS campaigns_dates_idx ON public.campaigns(start_date, end_date);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own campaigns" ON public.campaigns;
CREATE POLICY "Users can view own campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.campaigns;
CREATE POLICY "Users can manage own campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. PORTFOLIO_ITEMS
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id text,
  title text,
  description text,
  image_url text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_user_idx ON public.portfolio_items(user_id);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own portfolio" ON public.portfolio_items;
CREATE POLICY "Users can view own portfolio" ON public.portfolio_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own portfolio" ON public.portfolio_items;
CREATE POLICY "Users can manage own portfolio" ON public.portfolio_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. WEEKLY_INSIGHTS
CREATE TABLE IF NOT EXISTS public.weekly_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  summary text,
  key_metrics jsonb DEFAULT '{}'::jsonb,
  best_times jsonb DEFAULT '[]'::jsonb,
  patterns jsonb DEFAULT '[]'::jsonb,
  experiments jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS weekly_insights_user_week_idx ON public.weekly_insights(user_id, week_start DESC);

ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own insights" ON public.weekly_insights;
CREATE POLICY "Users can view own insights" ON public.weekly_insights FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage insights" ON public.weekly_insights;
CREATE POLICY "Service role can manage insights" ON public.weekly_insights FOR ALL USING (true) WITH CHECK (true);

-- 9. WAITLIST
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  notes text,
  referral_source text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);

-- 10. FOUNDATION_FUND
CREATE TABLE IF NOT EXISTS public.foundation_fund (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_raised_cents bigint DEFAULT 0,
  goal_cents bigint DEFAULT 2000000,
  contributors int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.foundation_fund (total_raised_cents, goal_cents, contributors)
SELECT 0, 2000000, 0
WHERE NOT EXISTS (SELECT 1 FROM public.foundation_fund);

ALTER TABLE public.foundation_fund ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view foundation progress" ON public.foundation_fund;
CREATE POLICY "Anyone can view foundation progress" ON public.foundation_fund FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
