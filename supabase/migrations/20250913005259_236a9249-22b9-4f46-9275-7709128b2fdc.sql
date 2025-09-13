-- Ensure extensions
create extension if not exists pgcrypto;

-- Drop existing views that might conflict
drop view if exists public.v_posts_with_latest cascade;
drop view if exists public.v_daily_perf cascade;
drop view if exists public.v_time_heatmap cascade;
drop view if exists public.post_metrics cascade;
drop view if exists public.social_accounts cascade;
drop view if exists public.profiles cascade;
drop view if exists public.weekly_insights cascade;

-- Core tables (create if not exists)
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  handle text,
  created_at timestamptz default now()
);

-- Enable RLS on social_accounts
alter table public.social_accounts enable row level security;

-- Create RLS policy for social_accounts
create policy if not exists "Users can manage their own social accounts"
  on public.social_accounts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  social_account_id uuid references public.social_accounts(id) on delete set null,
  title text,
  caption text,
  asset_url text,
  status text check (status in ('draft','scheduled','published')) default 'published',
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz default now(),
  campaign_id uuid
);

-- Enable RLS on posts
alter table public.posts enable row level security;

-- Create RLS policy for posts
create policy if not exists "Users can manage their own posts"
  on public.posts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Update existing post_metrics table structure if needed
alter table public.post_metrics 
  add column if not exists post_id uuid references public.posts(id) on delete cascade,
  add column if not exists captured_at timestamptz default now(),
  add column if not exists saves int default 0,
  add column if not exists shares int default 0;

-- Views
create or replace view public.v_post_latest as
select distinct on (pm.post_id)
  pm.post_id, pm.captured_at, pm.views, pm.likes, pm.comments, pm.saves, pm.shares
from public.post_metrics pm
order by pm.post_id, pm.captured_at desc;

create or replace view public.v_posts_with_latest as
select
  p.id as post_id, p.user_id, p.title, p.caption,
  p.asset_url, p.asset_url as url,
  p.status, p.scheduled_at, p.published_at, p.created_at,
  sa.platform,
  coalesce(v.views,0) views,
  coalesce(v.likes,0) likes,
  coalesce(v.comments,0) comments,
  coalesce(v.saves,0) saves,
  coalesce(v.shares,0) shares,
  case when coalesce(v.views,0)=0 then 0
       else round(100.0*(coalesce(v.likes,0)+coalesce(v.comments,0)+coalesce(v.saves,0)+coalesce(v.shares,0))/nullif(v.views,0),2)
  end engagement_rate
from public.posts p
left join public.v_post_latest v on v.post_id = p.id
left join public.social_accounts sa on sa.id = p.social_account_id and sa.user_id = p.user_id;

create or replace view public.v_daily_perf as
select
  p.user_id,
  date_trunc('day', coalesce(p.published_at, p.created_at))::date as day,
  sum(coalesce(v.views,0)) as day_views,
  avg(case when coalesce(v.views,0)=0 then 0
           else (coalesce(v.likes,0)+coalesce(v.comments,0)+coalesce(v.saves,0)+coalesce(v.shares,0))/nullif(v.views,0) end) * 100
    as avg_er_percent
from public.posts p
left join public.v_post_latest v on v.post_id = p.id
group by 1,2;

create or replace view public.v_time_heatmap as
with base as (
  select p.user_id, sa.platform,
         extract(dow  from coalesce(p.published_at, p.created_at))::int as dow,
         extract(hour from coalesce(p.published_at, p.created_at))::int as hour,
         v.views, v.likes, v.comments, v.saves, v.shares
  from public.posts p
  left join public.v_post_latest v on v.post_id = p.id
  left join public.social_accounts sa on sa.id = p.social_account_id and sa.user_id = p.user_id
  where coalesce(p.published_at, p.created_at) >= now() - interval '90 days'
)
select user_id, platform, dow, hour,
       round(100.0*avg(coalesce(likes,0)+coalesce(comments,0)+coalesce(saves,0)+coalesce(shares,0))/nullif(avg(nullif(views,0)),0),2)
         as avg_engagement_percent,
       count(*) as posts_count
from base
group by user_id, platform, dow, hour;

-- Functions
drop function if exists public.get_ugc_kpis();
drop function if exists public.get_ugc_kpis(date, date, text);
create or replace function public.get_ugc_kpis(p_from date, p_to date, p_platform text)
returns table(views_30d bigint, avg_er_30d numeric, posts_30d bigint, active_campaigns bigint)
language sql stable as $$
  with base as (
    select *
    from v_posts_with_latest
    where user_id = auth.uid()
      and (p_platform = 'all' or platform = p_platform)
      and ((p_from is null and p_to is null) or coalesce(published_at, created_at) between p_from and p_to)
  ),
  views30 as (select coalesce(sum(views),0)::bigint v from base),
  er30 as (select round(avg(engagement_rate),2) e from base),
  posts30 as (select count(*)::bigint c from base),
  camps as (
    select count(*)::bigint c
    from campaigns
    where user_id = auth.uid()
      and (start_date is null or start_date <= coalesce(p_to, current_date))
      and (end_date is null or end_date >= coalesce(p_from, current_date - interval '30 days'))
  )
  select (select v from views30), (select e from er30), (select c from posts30), (select c from camps);
$$;

create or replace function public.get_ugc_kpis()
returns table(views_30d bigint, avg_er_30d numeric, posts_30d bigint, active_campaigns bigint)
language sql stable as $$
  select * from get_ugc_kpis(current_date - interval '30 days', current_date, 'all');
$$;

drop function if exists public.get_daily_perf(date, date, text);
create or replace function public.get_daily_perf(p_from date, p_to date, p_platform text)
returns table(day date, day_views numeric, avg_er_percent numeric)
language sql stable as $$
  with base as (
    select p.user_id,
           date_trunc('day', coalesce(p.published_at, p.created_at))::date as day,
           v.views, v.likes, v.comments, v.saves, v.shares,
           sa.platform
    from public.posts p
    left join v_post_latest v on v.post_id = p.id
    left join public.social_accounts sa on sa.id = p.social_account_id and sa.user_id = p.user_id
    where p.user_id = auth.uid()
      and ((p_from is null and p_to is null) or coalesce(p.published_at, p.created_at) between p_from and p_to)
      and (p_platform = 'all' or sa.platform = p_platform)
  )
  select day,
         sum(coalesce(views,0)) as day_views,
         avg(case when coalesce(views,0)=0 then 0 else (coalesce(likes,0)+coalesce(comments,0)+coalesce(saves,0)+coalesce(shares,0))/nullif(views,0) end) * 100
  from base
  group by day
  order by day;
$$;