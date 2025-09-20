-- Comprehensive security fix for profiles access (Fixed policy handling)
-- Drop and recreate the public.profiles view with explicit security restrictions
DROP VIEW IF EXISTS public.profiles CASCADE;

-- Recreate the view with security_invoker and explicit filtering  
CREATE VIEW public.profiles 
WITH (security_invoker = true)
AS 
SELECT 
  user_id, 
  full_name, 
  plan, 
  timezone, 
  avatar_url, 
  phone, 
  metadata, 
  onboarded_at, 
  last_login_at, 
  created_at, 
  updated_at
FROM app.profiles
WHERE user_id = auth.uid();  -- Explicit filter to ensure only own data is accessible

-- Grant minimal necessary permissions
REVOKE ALL ON public.profiles FROM PUBLIC;
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT ON public.profiles TO authenticated;

-- Update the existing policies on app.profiles to be more explicit
DROP POLICY IF EXISTS "profiles_owner_crud" ON app.profiles;
CREATE POLICY "profiles_owner_crud" 
ON app.profiles 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Add/update policy to explicitly deny anonymous access
DROP POLICY IF EXISTS "profiles_no_anon_access" ON app.profiles;
CREATE POLICY "profiles_no_anon_access" 
ON app.profiles 
FOR ALL 
TO anon
USING (false);