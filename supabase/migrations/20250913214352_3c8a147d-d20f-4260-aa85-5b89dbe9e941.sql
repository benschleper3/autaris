-- Create core tables first
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  handle text,
  created_at timestamptz default now()
);

alter table public.social_accounts enable row level security;

drop policy if exists "Users can manage their own social accounts" on public.social_accounts;
create policy "Users can manage their own social accounts"
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

alter table public.posts enable row level security;

drop policy if exists "Users can manage their own posts" on public.posts;
create policy "Users can manage their own posts"
  on public.posts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create post_metrics table (not view)
create table if not exists public.post_metrics_table (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  captured_at timestamptz default now(),
  views int default 0,
  likes int default 0,
  comments int default 0,
  saves int default 0,
  shares int default 0
);

alter table public.post_metrics_table enable row level security;

drop policy if exists "Users can manage their own post metrics" on public.post_metrics_table;
create policy "Users can manage their own post metrics"
  on public.post_metrics_table
  for all
  using (auth.uid() = (select user_id from posts where id = post_id))
  with check (auth.uid() = (select user_id from posts where id = post_id));

-- Create views that use the new table structure
create or replace view public.v_post_latest as
select distinct on (pm.post_id)
  pm.post_id, pm.captured_at, pm.views, pm.likes, pm.comments, pm.saves, pm.shares
from public.post_metrics_table pm
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
left join public.social_accounts sa on sa.id = p.social_account_id;

-- Update the functions to work with new structure
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