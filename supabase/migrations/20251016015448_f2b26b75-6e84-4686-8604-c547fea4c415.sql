-- Create table for TikTok videos with per-video metrics
create table if not exists public.tiktok_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  open_id text,
  video_id text not null,
  title text,
  video_description text,
  share_url text,
  embed_link text,
  cover_image_url text,
  duration_seconds int,
  width int,
  height int,
  create_time timestamptz,
  view_count bigint,
  like_count int,
  comment_count int,
  share_count int,
  last_synced_at timestamptz not null default now(),
  unique (user_id, video_id)
);

-- Enable RLS
alter table public.tiktok_videos enable row level security;

-- Users can read their own videos
create policy "read own videos"
  on public.tiktok_videos for select
  using (auth.uid() = user_id);

-- Service role can insert videos
create policy "service write videos"
  on public.tiktok_videos for insert
  with check (true);

-- Service role can update videos
create policy "service update videos"
  on public.tiktok_videos for update
  using (true);