-- Add role enum and field to profiles table
CREATE TYPE public.user_role AS ENUM ('coach', 'ugc_creator');

-- Add role field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role public.user_role,
ADD COLUMN onboarded BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_onboarded ON public.profiles(onboarded);