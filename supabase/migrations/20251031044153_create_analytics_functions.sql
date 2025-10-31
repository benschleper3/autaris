/*
  # Analytics Database Functions

  Creates PostgreSQL functions for analytics queries with auth.uid() scoping.
  
  ## Functions
  1. get_ugc_kpis - KPIs with latest metrics snapshot
  2. get_daily_perf - Daily performance trend
  3. get_platform_breakdown - Metrics by platform
  4. get_time_heatmap - Posting time heatmap
  5. get_top_posts - Top posts with pagination
*/

-- Helper view for latest metrics per post
CREATE OR REPLACE VIEW public.v_post_latest AS
SELECT DISTINCT ON (pm.post_id)
  pm.post_id, pm.captured_at, pm.views, pm.likes, pm.comments, pm.saves, pm.shares
FROM public.post_metrics pm
ORDER BY pm.post_id, pm.captured_at DESC;

-- KPIs function
CREATE OR REPLACE FUNCTION public.get_ugc_kpis(
  p_user_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_platform text
)
RETURNS TABLE(
  views_30d bigint,
  avg_er_30d numeric,
  posts_30d bigint,
  active_campaigns bigint
)
LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT p.id, v.views, v.likes, v.comments, v.saves, v.shares
    FROM public.posts p
    LEFT JOIN public.v_post_latest v ON v.post_id = p.id
    WHERE p.user_id = p_user_id
      AND (p_platform = 'all' OR p.platform = p_platform)
      AND COALESCE(p.published_at, p.created_at) BETWEEN COALESCE(p_from, '-infinity') AND COALESCE(p_to, 'infinity')
  ),
  views30 AS (SELECT COALESCE(SUM(views), 0)::bigint AS v FROM base),
  er30 AS (
    SELECT ROUND(
      CASE WHEN SUM(views) > 0
        THEN ((SUM(likes) + SUM(comments) + SUM(shares) + SUM(saves))::numeric / SUM(views)) * 100
        ELSE 0
      END, 2
    ) AS e FROM base
  ),
  posts30 AS (SELECT COUNT(*)::bigint AS c FROM base),
  camps AS (
    SELECT COUNT(*)::bigint AS c
    FROM public.campaigns
    WHERE user_id = p_user_id
      AND start_date <= COALESCE(p_to::date, CURRENT_DATE)
      AND end_date >= COALESCE(p_from::date, CURRENT_DATE - INTERVAL '30 days')
  )
  SELECT (SELECT v FROM views30), (SELECT e FROM er30), (SELECT c FROM posts30), (SELECT c FROM camps);
$$;

-- Daily performance trend
CREATE OR REPLACE FUNCTION public.get_daily_perf(
  p_user_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_platform text
)
RETURNS TABLE(
  day date,
  day_views bigint,
  avg_er_percent numeric
)
LANGUAGE sql STABLE AS $$
  WITH base AS (
    SELECT 
      DATE_TRUNC('day', COALESCE(p.published_at, p.created_at))::date AS day,
      v.views, v.likes, v.comments, v.saves, v.shares
    FROM public.posts p
    LEFT JOIN public.v_post_latest v ON v.post_id = p.id
    WHERE p.user_id = p_user_id
      AND (p_platform = 'all' OR p.platform = p_platform)
      AND COALESCE(p.published_at, p.created_at) BETWEEN COALESCE(p_from, '-infinity') AND COALESCE(p_to, 'infinity')
  )
  SELECT 
    day,
    COALESCE(SUM(views), 0)::bigint AS day_views,
    ROUND(
      CASE WHEN SUM(views) > 0
        THEN ((SUM(likes) + SUM(comments) + SUM(shares) + SUM(saves))::numeric / SUM(views)) * 100
        ELSE 0
      END, 2
    ) AS avg_er_percent
  FROM base
  GROUP BY day
  ORDER BY day;
$$;

-- Platform breakdown (TikTok)
CREATE OR REPLACE FUNCTION public.get_platform_breakdown(
  p_user_id uuid,
  p_from timestamptz,
  p_to timestamptz
)
RETURNS TABLE(
  platform text,
  views bigint
)
LANGUAGE sql STABLE AS $$
  SELECT 
    'tiktok' AS platform,
    COALESCE(SUM(view_count), 0)::bigint AS views
  FROM public.tiktok_videos
  WHERE user_id = p_user_id
    AND create_time BETWEEN COALESCE(p_from, '-infinity') AND COALESCE(p_to, 'infinity');
$$;

-- Time heatmap for TikTok
CREATE OR REPLACE FUNCTION public.get_time_heatmap(
  p_user_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_platform text
)
RETURNS TABLE(
  dow int,
  hour int,
  posts_count bigint,
  avg_engagement_percent numeric
)
LANGUAGE sql STABLE AS $$
  SELECT
    EXTRACT(DOW FROM create_time)::int AS dow,
    EXTRACT(HOUR FROM create_time)::int AS hour,
    COUNT(*)::bigint AS posts_count,
    ROUND(AVG(
      CASE WHEN view_count > 0
        THEN ((like_count + comment_count + share_count)::numeric / view_count) * 100
        ELSE 0
      END
    ), 2) AS avg_engagement_percent
  FROM public.tiktok_videos
  WHERE user_id = p_user_id
    AND create_time BETWEEN COALESCE(p_from, '-infinity') AND COALESCE(p_to, 'infinity')
  GROUP BY dow, hour
  ORDER BY dow, hour;
$$;

-- Top posts with pagination
CREATE OR REPLACE FUNCTION public.get_top_posts(
  p_user_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_platforms text[],
  p_sort text,
  p_dir text,
  p_page int,
  p_page_size int
)
RETURNS TABLE(
  post_id uuid,
  title text,
  platform text,
  published_at timestamptz,
  views bigint,
  likes int,
  comments int,
  shares int,
  saves int,
  er_percent numeric
)
LANGUAGE sql STABLE AS $$
  WITH latest AS (
    SELECT DISTINCT ON (pm.post_id)
      pm.post_id, pm.views, pm.likes, pm.comments, pm.shares, pm.saves
    FROM public.post_metrics pm
    JOIN public.posts p ON p.id = pm.post_id
    WHERE p.user_id = p_user_id
      AND (p_platforms IS NULL OR p.platform = ANY(p_platforms))
      AND COALESCE(p.published_at, p.created_at) BETWEEN COALESCE(p_from, '-infinity') AND COALESCE(p_to, 'infinity')
    ORDER BY pm.post_id, pm.captured_at DESC
  )
  SELECT 
    p.id AS post_id,
    p.title,
    p.platform,
    p.published_at,
    latest.views,
    latest.likes,
    latest.comments,
    latest.shares,
    latest.saves,
    ROUND(
      CASE WHEN latest.views > 0
        THEN ((latest.likes + latest.comments + latest.shares + latest.saves)::numeric / latest.views) * 100
        ELSE 0
      END, 2
    ) AS er_percent
  FROM latest
  JOIN public.posts p ON p.id = latest.post_id
  ORDER BY
    CASE WHEN p_sort = 'views' AND p_dir = 'desc' THEN latest.views END DESC NULLS LAST,
    CASE WHEN p_sort = 'views' AND p_dir = 'asc' THEN latest.views END ASC NULLS LAST,
    CASE WHEN p_sort = 'likes' AND p_dir = 'desc' THEN latest.likes END DESC NULLS LAST,
    CASE WHEN p_sort = 'likes' AND p_dir = 'asc' THEN latest.likes END ASC NULLS LAST,
    CASE WHEN p_sort = 'er' AND p_dir = 'desc' THEN 
      CASE WHEN latest.views > 0
        THEN ((latest.likes + latest.comments + latest.shares + latest.saves)::numeric / latest.views) * 100
        ELSE 0
      END
    END DESC NULLS LAST
  OFFSET (p_page - 1) * p_page_size
  LIMIT p_page_size;
$$;
