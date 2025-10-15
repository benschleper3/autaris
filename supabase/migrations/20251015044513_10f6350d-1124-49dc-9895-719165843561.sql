-- Remove all Alex Rivera mock data and any orphaned data

-- Delete all post metrics first (foreign key)
DELETE FROM public.post_metrics 
WHERE post_id IN (
  SELECT p.id FROM public.posts p 
  JOIN public.social_accounts sa ON sa.id = p.social_account_id 
  WHERE sa.display_name = 'Alex Rivera' OR sa.platform = 'tiktok'
);

-- Delete all posts for TikTok accounts
DELETE FROM public.posts 
WHERE social_account_id IN (
  SELECT id FROM public.social_accounts 
  WHERE display_name = 'Alex Rivera' OR platform = 'tiktok'
);

-- Delete all TikTok social accounts
DELETE FROM public.social_accounts 
WHERE display_name = 'Alex Rivera' OR platform = 'tiktok';

-- Also clean up any AI insights for those posts
DELETE FROM public.post_ai_insights 
WHERE post_id NOT IN (SELECT id FROM public.posts);

-- Clean up any weekly insights that might be orphaned
DELETE FROM public.weekly_insights 
WHERE user_id NOT IN (SELECT id FROM auth.users);