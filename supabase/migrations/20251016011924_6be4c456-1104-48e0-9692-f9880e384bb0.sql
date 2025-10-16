-- Ensure unique connection per user/platform (prevents duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS uq_social_accounts_user_platform 
ON public.social_accounts (user_id, platform);