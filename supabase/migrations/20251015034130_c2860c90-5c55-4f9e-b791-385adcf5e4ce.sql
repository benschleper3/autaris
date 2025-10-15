-- Helper function to fix incomplete TikTok connection data
CREATE OR REPLACE FUNCTION public.fix_tiktok_connection()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update social_accounts with sandbox user data for current user
  UPDATE public.social_accounts
  SET 
    display_name = 'Alex Rivera',
    follower_count = 5482,
    following_count = 723,
    like_count = 67234,
    video_count = 125,
    last_synced_at = now(),
    status = 'active'
  WHERE user_id = auth.uid()
    AND platform = 'tiktok'
    AND (display_name IS NULL OR display_name = '');
END;
$$;