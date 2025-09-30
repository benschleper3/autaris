-- Create foundation_fund table to track fundraising progress
CREATE TABLE public.foundation_fund (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_raised_cents bigint NOT NULL DEFAULT 0,
  goal_cents bigint NOT NULL DEFAULT 2000000,
  contributors integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert initial row
INSERT INTO public.foundation_fund (total_raised_cents, goal_cents, contributors)
VALUES (0, 2000000, 0);

-- Enable Row Level Security
ALTER TABLE public.foundation_fund ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view foundation progress"
ON public.foundation_fund
FOR SELECT
USING (true);

-- Only admins can update
CREATE POLICY "Only admins can update foundation progress"
ON public.foundation_fund
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admins a
    WHERE a.user_id = auth.uid()
  )
);

-- Enable realtime
ALTER TABLE public.foundation_fund REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.foundation_fund;