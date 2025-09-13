-- Fix the function signature issue
drop function if exists public.get_ugc_kpis();

create or replace function public.get_ugc_kpis()
returns table(views_30d bigint, avg_er_30d numeric, posts_30d bigint, active_campaigns bigint)
language sql stable as $$
  select * from get_ugc_kpis((current_date - interval '30 days')::date, current_date, 'all');
$$;

-- Also add the daily performance function
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