-- Function to clean up all TikTok data for current user
CREATE OR REPLACE FUNCTION public.cleanup_tiktok_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_metrics_deleted int;
  v_posts_deleted int;
  v_accounts_deleted int;
BEGIN
  -- Delete metrics
  DELETE FROM public.post_metrics WHERE post_id IN (
    SELECT p.id FROM public.posts p 
    JOIN public.social_accounts sa ON sa.id = p.social_account_id 
    WHERE sa.user_id = auth.uid() AND sa.platform = 'tiktok'
  );
  GET DIAGNOSTICS v_metrics_deleted = ROW_COUNT;

  -- Delete posts
  DELETE FROM public.posts WHERE social_account_id IN (
    SELECT id FROM public.social_accounts 
    WHERE user_id = auth.uid() AND platform = 'tiktok'
  );
  GET DIAGNOSTICS v_posts_deleted = ROW_COUNT;

  -- Delete social account
  DELETE FROM public.social_accounts 
  WHERE user_id = auth.uid() AND platform = 'tiktok';
  GET DIAGNOSTICS v_accounts_deleted = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted', jsonb_build_object(
      'metrics', v_metrics_deleted,
      'posts', v_posts_deleted,
      'accounts', v_accounts_deleted
    )
  );
END;
$$;