-- Convert recommendations column from text to jsonb array
ALTER TABLE weekly_insights 
  ALTER COLUMN recommendations TYPE JSONB 
  USING 
    CASE 
      WHEN recommendations IS NULL THEN '[]'::jsonb
      WHEN recommendations = '' THEN '[]'::jsonb
      ELSE jsonb_build_array(recommendations)
    END;