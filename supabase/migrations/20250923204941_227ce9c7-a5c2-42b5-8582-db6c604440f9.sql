-- Fix search path security issues for the functions I just created
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