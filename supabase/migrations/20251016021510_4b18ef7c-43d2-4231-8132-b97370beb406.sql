-- Update weekly_insights table to match code expectations

-- Drop old columns
ALTER TABLE weekly_insights DROP COLUMN IF EXISTS insight;
ALTER TABLE weekly_insights DROP COLUMN IF EXISTS narrative;
ALTER TABLE weekly_insights DROP COLUMN IF EXISTS confidence;

-- Add new columns that the code expects
ALTER TABLE weekly_insights ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE weekly_insights ADD COLUMN IF NOT EXISTS key_metrics JSONB DEFAULT '{}'::jsonb;
ALTER TABLE weekly_insights ADD COLUMN IF NOT EXISTS best_times JSONB DEFAULT '[]'::jsonb;
ALTER TABLE weekly_insights ADD COLUMN IF NOT EXISTS patterns JSONB DEFAULT '[]'::jsonb;
ALTER TABLE weekly_insights ADD COLUMN IF NOT EXISTS experiments JSONB DEFAULT '[]'::jsonb;

-- Keep recommendations column (already exists)