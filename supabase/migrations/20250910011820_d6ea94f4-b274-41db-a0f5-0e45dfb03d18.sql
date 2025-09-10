-- Add missing columns to report_links table
ALTER TABLE public.report_links 
ADD COLUMN IF NOT EXISTS from_date date,
ADD COLUMN IF NOT EXISTS to_date date,
ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES public.campaigns(id);

-- Update campaigns table to have campaign_name if missing
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS campaign_name text;