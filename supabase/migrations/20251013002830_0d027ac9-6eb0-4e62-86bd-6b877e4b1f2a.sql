-- Idempotent migration to ensure social_accounts has all required columns
-- Add missing columns only if they don't exist

DO $$ 
BEGIN
  -- Ensure platform column exists with default
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'social_accounts' 
                 AND column_name = 'platform') THEN
    ALTER TABLE public.social_accounts ADD COLUMN platform text NOT NULL DEFAULT 'tiktok';
  END IF;

  -- Ensure external_id exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'social_accounts' 
                 AND column_name = 'external_id') THEN
    ALTER TABLE public.social_accounts ADD COLUMN external_id text;
  END IF;

  -- Ensure handle exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'social_accounts' 
                 AND column_name = 'handle') THEN
    ALTER TABLE public.social_accounts ADD COLUMN handle text;
  END IF;

  -- Ensure avatar_url exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'social_accounts' 
                 AND column_name = 'avatar_url') THEN
    ALTER TABLE public.social_accounts ADD COLUMN avatar_url text;
  END IF;

  -- Ensure follower_count exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'social_accounts' 
                 AND column_name = 'follower_count') THEN
    ALTER TABLE public.social_accounts ADD COLUMN follower_count integer DEFAULT 0;
  END IF;

  -- Add likes_count if it doesn't exist (in addition to like_count)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'social_accounts' 
                 AND column_name = 'likes_count') THEN
    ALTER TABLE public.social_accounts ADD COLUMN likes_count integer DEFAULT 0;
  END IF;

  -- Ensure video_count exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'social_accounts' 
                 AND column_name = 'video_count') THEN
    ALTER TABLE public.social_accounts ADD COLUMN video_count integer DEFAULT 0;
  END IF;

  -- Ensure last_synced_at exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'social_accounts' 
                 AND column_name = 'last_synced_at') THEN
    ALTER TABLE public.social_accounts ADD COLUMN last_synced_at timestamptz;
  END IF;
END $$;