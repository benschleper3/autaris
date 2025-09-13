-- Create the posts table since it doesn't exist
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

-- Recreate the post_metrics table since it might not exist
create table if not exists public.post_metrics_new (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  captured_at timestamptz default now(),
  views int default 0,
  likes int default 0,
  comments int default 0,
  saves int default 0,
  shares int default 0
);

alter table public.post_metrics_new enable row level security;

drop policy if exists "Users can manage their own post metrics" on public.post_metrics_new;
create policy "Users can manage their own post metrics"
  on public.post_metrics_new
  for all
  using (auth.uid() = (select user_id from posts where id = post_id))
  with check (auth.uid() = (select user_id from posts where id = post_id));

-- Recreate the view with the correct table name
create or replace view public.v_post_latest as
select distinct on (pm.post_id)
  pm.post_id, pm.captured_at, pm.views, pm.likes, pm.comments, pm.saves, pm.shares
from public.post_metrics_new pm
order by pm.post_id, pm.captured_at desc;

-- Now the daily performance function should work
create or replace function public.get_daily_perf(p_from date, p_to date, p_platform text)
returns table(day date, day_views numeric, avg_er_percent numeric)
language sql stable as $$
  with base as (
    select p.user_id,
           date_trunc('day', coalesce(p.published_at, p.created_at))::date as day,
           v.views, v.likes, v.comments, v.saves, v.shares,
           sa.platform::text as platform
    from public.posts p
    left join v_post_latest v on v.post_id = p.id
    left join public.social_accounts sa on sa.id = p.social_account_id and sa.user_id = p.user_id
    where p.user_id = auth.uid()
      and ((p_from is null and p_to is null) or coalesce(p.published_at, p.created_at) between p_from and p_to)
      and (p_platform = 'all' or sa.platform::text = p_platform)
  )
  select day,
         sum(coalesce(views,0))::numeric as day_views,
         (avg(case when coalesce(views,0)=0 then 0 else (coalesce(likes,0)+coalesce(comments,0)+coalesce(saves,0)+coalesce(shares,0))::numeric/nullif(views,0) end) * 100)::numeric
  from base
  group by day
  order by day;
$$;