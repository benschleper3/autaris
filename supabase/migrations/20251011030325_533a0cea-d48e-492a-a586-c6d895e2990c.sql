-- Add display_name column to social_accounts for TikTok user info
ALTER TABLE public.social_accounts 
ADD COLUMN IF NOT EXISTS display_name text;