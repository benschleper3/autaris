-- Fix the remaining function with search path security issue
CREATE OR REPLACE FUNCTION public.upsert_metrics(p_user_id uuid, p_platform text, p_handle text, p_post jsonb, p_metrics jsonb, p_captured_at timestamp with time zone)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
declare
  v_social_id uuid;
  v_post_id uuid;
begin
  -- 1) ensure social
  insert into public.social_accounts (user_id, platform, handle, status)
  values (p_user_id, p_platform, p_handle, 'active')
  on conflict (user_id, platform, handle) do update set last_synced_at = now()
  returning id into v_social_id;

  -- 2) create/find post
  insert into public.posts (user_id, social_account_id, title, caption, asset_url, published_at, created_at)
  values (
    p_user_id,
    v_social_id,
    coalesce(p_post->>'title', null),
    coalesce(p_post->>'caption', null),
    coalesce(p_post->>'asset_url', null),
    (p_post->>'published_at')::timestamptz,
    now()
  )
  on conflict do nothing;

  select p.id into v_post_id
  from public.posts p
  where p.user_id = p_user_id
    and p.social_account_id = v_social_id
    and (p.asset_url is not distinct from coalesce(p_post->>'asset_url', null))
  order by p.created_at desc limit 1;

  if v_post_id is null then
    raise exception 'Could not resolve post_id';
  end if;

  -- 3) insert snapshot
  insert into public.post_metrics (post_id, captured_at, views, likes, comments, shares, saves)
  values (
    v_post_id,
    coalesce(p_captured_at, now()),
    coalesce((p_metrics->>'views')::int, 0),
    coalesce((p_metrics->>'likes')::int, 0),
    coalesce((p_metrics->>'comments')::int, 0),
    coalesce((p_metrics->>'shares')::int, 0),
    coalesce((p_metrics->>'saves')::int, 0)
  );

  return json_build_object('ok', true, 'post_id', v_post_id);
end $function$;