-- Ensure platform column exists (enum app.social_platform) — ok to re-run
alter table app.weekly_insights
  add column if not exists platform app.social_platform;

-- Replace old unique constraint (user_id, week_start) with (user_id, week_start, platform)
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'weekly_insights_user_id_week_start_key'
      and conrelid = 'app.weekly_insights'::regclass
  ) then
    execute 'alter table app.weekly_insights drop constraint weekly_insights_user_id_week_start_key';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'weekly_insights_user_week_platform_key'
      and conrelid = 'app.weekly_insights'::regclass
  ) then
    execute 'alter table app.weekly_insights add constraint weekly_insights_user_week_platform_key unique (user_id, week_start, platform)';
  end if;
end $$;

-- Helpful index for queries
create index if not exists idx_weekly_insights_platform_week
  on app.weekly_insights(platform, week_start desc);

-- Refresh public view
create or replace view public.weekly_insights as select * from app.weekly_insights;