-- Update get_ugc_kpis to accept user_id parameter
CREATE OR REPLACE FUNCTION public.get_ugc_kpis(p_user_id uuid, p_from date, p_to date, p_platform text)
RETURNS TABLE(views_30d bigint, avg_er_30d numeric, posts_30d bigint, active_campaigns bigint)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  with base as (
    select *
    from public.v_posts_with_latest
    where user_id = p_user_id
      and (p_platform = 'all' or platform = p_platform)
      and ( (p_from is null and p_to is null)
            or coalesce(published_at, created_at) between p_from and p_to )
  ),
  views30 as (select coalesce(sum(views),0)::bigint v from base),
  er30    as (select round(avg(engagement_rate),2) e from base),
  posts30 as (select count(*)::bigint c from base),
  camps   as (
    select count(*)::bigint c
    from public.campaigns
    where user_id = p_user_id
      and (start_date is null or start_date <= coalesce(p_to, current_date))
      and (end_date   is null or end_date   >= coalesce(p_from, current_date - interval '30 days'))
  )
  select (select v from views30),
         (select e from er30),
         (select c from posts30),
         (select c from camps);
$$;

-- Update get_daily_perf to accept user_id parameter
CREATE OR REPLACE FUNCTION public.get_daily_perf(p_user_id uuid, p_from date, p_to date, p_platform text)
RETURNS TABLE(day date, day_views numeric, avg_er_percent numeric)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  with base as (
    select
      p.user_id,
      date_trunc('day', coalesce(p.published_at, p.created_at))::date as day,
      v.views, v.likes, v.comments, v.saves, v.shares,
      sa.platform
    from public.posts p
    left join public.v_post_latest v on v.post_id = p.id
    left join public.social_accounts sa on sa.id = p.social_account_id and sa.user_id = p.user_id
    where p.user_id = p_user_id
      and ( (p_from is null and p_to is null)
            or coalesce(p.published_at, p.created_at) between p_from and p_to )
      and (p_platform = 'all' or sa.platform = p_platform)
  )
  select
    day,
    sum(coalesce(views,0)) as day_views,
    avg(
      case when coalesce(views,0)=0 then 0
           else (coalesce(likes,0)+coalesce(comments,0)+coalesce(saves,0)+coalesce(shares,0)) / nullif(views,0)
      end
    ) * 100 as avg_er_percent
  from base
  group by day
  order by day;
$$;