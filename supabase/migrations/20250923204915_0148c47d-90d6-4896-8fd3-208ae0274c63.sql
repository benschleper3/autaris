-- Drop the profiles view if it exists and create a proper table
DROP VIEW IF EXISTS public.profiles;

-- Create the profiles table with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  plan text DEFAULT 'Starter',
  timezone text DEFAULT 'UTC',
  metadata jsonb DEFAULT '{}',
  onboarded_at timestamp with time zone,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  meta_full_name text := nullif(trim(meta->>'full_name'), '');
  meta_plan text := nullif(trim(meta->>'plan'), '');
  meta_tz text := nullif(trim(meta->>'timezone'), '');
begin
  insert into public.profiles (
    user_id, email, full_name, plan, timezone, avatar_url, phone, metadata, onboarded_at, last_login_at, created_at
  ) values (
    new.id,
    new.email,
    meta_full_name,
    coalesce(meta_plan, 'Starter'),
    coalesce(meta_tz, 'UTC'),
    nullif(trim(meta->>'avatar_url'), ''),
    nullif(trim(meta->>'phone'), ''),
    meta,
    now(), now(), now()
  )
  on conflict (user_id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        plan = coalesce(excluded.plan, public.profiles.plan),
        timezone = coalesce(excluded.timezone, public.profiles.timezone),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        phone = coalesce(excluded.phone, public.profiles.phone),
        metadata = public.profiles.metadata || excluded.metadata,
        last_login_at = now();
  return new;
end;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();