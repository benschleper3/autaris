-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own profile data
-- Users can view, update, insert, and delete their own profile
CREATE POLICY "Users can manage their own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Also ensure user_id is set properly for new profiles
-- Create a trigger to automatically set user_id for new profiles if not provided
CREATE OR REPLACE FUNCTION public.set_profile_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is not set, set it to the current authenticated user
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user_id on insert
CREATE TRIGGER set_profile_user_id_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_user_id();