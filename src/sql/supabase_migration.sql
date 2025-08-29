-- Ensure schema exists
create schema if not exists app;

-- Drop leftover public.profiles table if it exists (prevents duplicate error)
do $$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'profiles'
      and c.relkind = 'r'  -- 'r' = table
  ) then
    execute 'drop table public.profiles cascade';
  end if;
end $$;

-- Enums
do $$ begin
  create type app.social_platform as enum ('tiktok','instagram','facebook','twitter','linkedin','youtube');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.account_status as enum ('active','paused','disconnected','error');
exception when duplicate_object then null; end $$;

-- Profiles table
create table if not exists app.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  plan text default 'Starter',
  timezone text default 'UTC',
  avatar_url text,
  phone text,
  metadata jsonb not null default '{}'::jsonb,
  onboarded_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function app.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_profiles_touch on app.profiles;
create trigger trg_profiles_touch before update on app.profiles
for each row execute function app.touch_updated_at();

-- Social accounts
create table if not exists app.social_accounts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform app.social_platform not null,
  handle text not null,
  external_id text not null,
  status app.account_status not null default 'active',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform, external_id)
);
drop trigger if exists trg_social_accounts_touch on app.social_accounts;
create trigger trg_social_accounts_touch before update on app.social_accounts
for each row execute function app.touch_updated_at();
create index if not exists idx_social_accounts_user on app.social_accounts(user_id);
create index if not exists idx_social_accounts_platform on app.social_accounts(platform);

-- Post metrics
create table if not exists app.post_metrics (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  social_account_id bigint not null references app.social_accounts(id) on delete cascade,
  post_id text not null,
  title text,
  url text,
  published_at timestamptz,
  views bigint not null default 0,
  likes bigint not null default 0,
  comments bigint not null default 0,
  shares bigint not null default 0,
  engagement_rate double precision
    generated always as (case when views > 0
      then (likes + comments + shares)::double precision / views::double precision else 0 end) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (social_account_id, post_id)
);
drop trigger if exists trg_post_metrics_touch on app.post_metrics;
create trigger trg_post_metrics_touch before update on app.post_metrics
for each row execute function app.touch_updated_at();
create index if not exists idx_post_metrics_user on app.post_metrics(user_id);
create index if not exists idx_post_metrics_account on app.post_metrics(social_account_id);
create index if not exists idx_post_metrics_published on app.post_metrics(published_at desc);
create index if not exists idx_post_metrics_engagement on app.post_metrics(engagement_rate desc);

-- Weekly insights
create table if not exists app.weekly_insights (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  narrative text,
  recommendations text,
  best_times jsonb,
  top_posts jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start),
  constraint chk_week_start_is_monday check (date_trunc('week', week_start)::date = week_start)
);
drop trigger if exists trg_weekly_insights_touch on app.weekly_insights;
create trigger trg_weekly_insights_touch before update on app.weekly_insights
for each row execute function app.touch_updated_at();
create index if not exists idx_weekly_insights_user on app.weekly_insights(user_id);
create index if not exists idx_weekly_insights_week on app.weekly_insights(week_start desc);

-- RLS
alter table app.profiles         enable row level security;
alter table app.social_accounts  enable row level security;
alter table app.post_metrics     enable row level security;
alter table app.weekly_insights  enable row level security;

-- Policies (profiles: auto-detects id vs user_id)
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='app' and table_name='profiles' and column_name='user_id') then
    execute $p$
      create policy if not exists "profiles_owner_crud" on app.profiles
      using (auth.uid() = user_id) with check (auth.uid() = user_id)
    $p$;
  elsif exists (select 1 from information_schema.columns where table_schema='app' and table_name='profiles' and column_name='id') then
    execute $p$
      create policy if not exists "profiles_owner_crud" on app.profiles
      using (auth.uid() = id) with check (auth.uid() = id)
    $p$;
  end if;
end $$;

do $$ begin
  create policy if not exists "social_accounts_owner_crud"
    on app.social_accounts using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy if not exists "post_metrics_owner_crud"
    on app.post_metrics using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy if not exists "weekly_insights_owner_crud"
    on app.weekly_insights using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Views in public
create or replace view public.profiles        as select * from app.profiles;
create or replace view public.social_accounts as select * from app.social_accounts;
create or replace view public.post_metrics    as select * from app.post_metrics;
create or replace view public.weekly_insights as select * from app.weekly_insights;