-- Clean up duplicate policies on app.profiles table
-- Drop redundant policies, keeping only the comprehensive one
DO $$
BEGIN
  -- Drop individual CRUD policies since we have a comprehensive ALL policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'app' AND tablename = 'profiles' AND policyname = 'Users can delete their own profile') THEN
    DROP POLICY "Users can delete their own profile" ON app.profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'app' AND tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
    DROP POLICY "Users can insert their own profile" ON app.profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'app' AND tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    DROP POLICY "Users can update their own profile" ON app.profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'app' AND tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    DROP POLICY "Users can view their own profile" ON app.profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'app' AND tablename = 'profiles' AND policyname = 'manage own profile') THEN
    DROP POLICY "manage own profile" ON app.profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'app' AND tablename = 'profiles' AND policyname = 'read own profile') THEN
    DROP POLICY "read own profile" ON app.profiles;
  END IF;
END $$;

-- Ensure the primary policy exists and is properly configured
DROP POLICY IF EXISTS "profiles_owner_crud" ON app.profiles;
CREATE POLICY "profiles_owner_crud" 
ON app.profiles 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Keep the admin access policy for administrative functions
-- This allows admins to view all profiles for support purposes