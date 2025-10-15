-- Complete TikTok data cleanup - remove ALL TikTok-related data

-- First, delete all post metrics for ALL TikTok posts
DELETE FROM public.post_metrics 
WHERE post_id IN (
  SELECT p.id FROM public.posts p 
  JOIN public.social_accounts sa ON sa.id = p.social_account_id 
  WHERE sa.platform = 'tiktok'
);

-- Delete all AI insights for TikTok posts
DELETE FROM public.post_ai_insights 
WHERE post_id IN (
  SELECT p.id FROM public.posts p 
  JOIN public.social_accounts sa ON sa.id = p.social_account_id 
  WHERE sa.platform = 'tiktok'
);

-- Delete all posts associated with TikTok accounts
DELETE FROM public.posts 
WHERE social_account_id IN (
  SELECT id FROM public.social_accounts WHERE platform = 'tiktok'
);

-- Delete all TikTok social accounts
DELETE FROM public.social_accounts WHERE platform = 'tiktok';

-- Verify cleanup
DO $$ 
BEGIN
  RAISE NOTICE 'Cleanup complete. Remaining TikTok accounts: %', 
    (SELECT COUNT(*) FROM public.social_accounts WHERE platform = 'tiktok');
END $$;