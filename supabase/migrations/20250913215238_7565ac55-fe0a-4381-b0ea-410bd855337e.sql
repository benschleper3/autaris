-- Create all core tables together
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