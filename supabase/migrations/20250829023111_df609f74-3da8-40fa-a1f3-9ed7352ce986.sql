-- Fix critical security issue: Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policy to restrict admin table access to admins only
CREATE POLICY "Only admins can view admin list"
ON public.admins
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins a2 
    WHERE a2.user_id = auth.uid()
  )
);

-- Allow admins to manage other admins
CREATE POLICY "Admins can manage admin list"
ON public.admins
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins a2 
    WHERE a2.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins a2 
    WHERE a2.user_id = auth.uid()
  )
);