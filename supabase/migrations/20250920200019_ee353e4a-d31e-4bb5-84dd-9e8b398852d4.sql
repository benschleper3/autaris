-- Comprehensive security fix for profiles access
-- The issue is that while app.profiles has RLS, the public.profiles view needs additional security

-- First, ensure the public.profiles view has proper security context
-- Drop and recreate with explicit security restrictions
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

-- Also ensure that the app.profiles table has a more restrictive policy for anon users
-- Update the existing policies to be more explicit
DROP POLICY IF EXISTS "profiles_owner_crud" ON app.profiles;
CREATE POLICY "profiles_owner_crud" 
ON app.profiles 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Add a policy to explicitly deny anonymous access
CREATE POLICY "profiles_no_anon_access" 
ON app.profiles 
FOR ALL 
TO anon
USING (false);

-- Ensure user_id cannot be null by adding a check constraint if not already present
ALTER TABLE app.profiles 
ADD CONSTRAINT IF NOT EXISTS profiles_user_id_not_null 
CHECK (user_id IS NOT NULL);