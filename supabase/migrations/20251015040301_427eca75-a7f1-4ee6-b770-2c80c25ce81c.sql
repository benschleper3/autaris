-- Add unique constraint for posts to support upsert operations
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_external_unique 
UNIQUE (user_id, external_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_user_external 
ON public.posts(user_id, external_id);