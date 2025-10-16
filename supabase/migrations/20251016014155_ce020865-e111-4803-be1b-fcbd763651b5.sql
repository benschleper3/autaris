-- Create weekly_insights table for AI-generated insights
create table if not exists public.weekly_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  summary text not null,
  key_metrics jsonb not null default '{}'::jsonb,
  best_times jsonb not null default '[]'::jsonb,
  patterns text[] not null default '{}',
  experiments text[] not null default '{}',
  recommendations text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Create index for efficient user+week lookups
create index if not exists idx_weekly_insights_user_week
  on public.weekly_insights (user_id, week_start desc);

-- Enable RLS
alter table public.weekly_insights enable row level security;

-- Users can view their own insights
create policy "Users can view own insights"
  on public.weekly_insights
  for select
  using (auth.uid() = user_id);

-- Service role can insert/update insights (for edge function)
create policy "Service role can manage insights"
  on public.weekly_insights
  for all
  using (true)
  with check (true);