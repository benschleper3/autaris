// src/pages/Platform.tsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Row = { title: string|null; url: string|null; published_at: string|null; views: number|null; likes: number|null; comments: number|null; shares: number|null; engagement_rate: number|null; };
type Insight = { week_start: string; summary: string|null; recommendations: any; };

const fmt = (n: number) => Intl.NumberFormat().format(Math.max(0, Math.floor(n)));

export default function Platform() {
  const { platform } = useParams<{ platform: string }>();
  const platformLower = platform?.toLowerCase();

  const [rows, setRows] = useState<Row[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const sinceISO = useMemo(() => new Date(Date.now() - 7*24*60*60*1000).toISOString(), []);

  useEffect(() => {
    if (!platformLower) return;

    // 1) Find account ids for this platform
    supabase.from('social_accounts')
      .select('id')
      .eq('platform', platformLower)
      .then(async ({ data: accounts, error }) => {
        if (error) { setErr(error.message); return; }
        const ids = (accounts ?? []).map(a => a.id);
        if (ids.length === 0) { setRows([]); return; }

        // 2) Pull last 7d posts for those accounts from posts table
        const { data: postsData, error: postsErr } = await supabase
          .from('posts')
          .select('id,title,asset_url,published_at')
          .in('social_account_id', ids)
          .gte('published_at', sinceISO)
          .order('published_at', { ascending: false })
          .limit(25);
        if (postsErr) { setErr(postsErr.message); return; }
        
        // Get metrics for these posts
        if (postsData && postsData.length > 0) {
          const postIds = postsData.map(p => p.id);
          const { data: metricsData, error: metricsErr } = await supabase
            .from('post_metrics')
            .select('post_id,views,likes,comments,shares')
            .in('post_id', postIds);
          
          if (!metricsErr) {
            // Join posts with their latest metrics
            const joinedData = postsData.map(post => {
              const metrics = metricsData?.find(m => m.post_id === post.id);
              const totalEngagement = (metrics?.likes || 0) + (metrics?.comments || 0) + (metrics?.shares || 0);
              const engagementRate = metrics?.views ? totalEngagement / metrics.views : 0;
              
              return {
                title: post.title,
                url: post.asset_url,
                published_at: post.published_at,
                views: metrics?.views || 0,
                likes: metrics?.likes || 0,
                comments: metrics?.comments || 0,
                shares: metrics?.shares || 0,
                engagement_rate: engagementRate
              };
            });
            
            setRows(joinedData);
          }
        } else {
          setRows([]);
        }
      });

    // 3) This week's general insight (until we store per-platform)
    const mondayISO = (() => {
      const d = new Date(); d.setHours(0,0,0,0);
      const diff = (d.getDay() === 0 ? 6 : d.getDay() - 1);
      d.setDate(d.getDate() - diff);
      return d.toISOString().slice(0,10);
    })();

    supabase.from('weekly_insights')
      .select('week_start,summary,recommendations')
      .eq('week_start', mondayISO)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        else setInsight(data);
      });
  }, [platformLower, sinceISO]);

  const kpi = useMemo(() => rows.reduce((a, r) => ({
    views: a.views + (r.views ?? 0),
    likes: a.likes + (r.likes ?? 0),
    comments: a.comments + (r.comments ?? 0),
    shares: a.shares + (r.shares ?? 0),
  }), { views: 0, likes: 0, comments: 0, shares: 0 }), [rows]);

  if (err) return <div className="p-4 text-red-600">Error: {err}</div>;
  if (!platformLower) return null;

  const titleCase = platformLower.toUpperCase();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{titleCase} · Performance & Recommendations</h1>
        <Link to="/" className="underline text-sm">← Back to dashboard</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Views (7d)</div><div className="text-2xl font-bold">{fmt(kpi.views)}</div></div>
        <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Likes (7d)</div><div className="text-2xl font-bold">{fmt(kpi.likes)}</div></div>
        <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Comments (7d)</div><div className="text-2xl font-bold">{fmt(kpi.comments)}</div></div>
        <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Shares (7d)</div><div className="text-2xl font-bold">{fmt(kpi.shares)}</div></div>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Top posts (7d)</h2>
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead><tr className="text-left">
              <th className="p-3">Title</th>
              <th className="p-3">Views</th>
              <th className="p-3">Likes</th>
              <th className="p-3">Comments</th>
              <th className="p-3">Shares</th>
              <th className="p-3">Eng. rate</th>
            </tr></thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">
                    <a href={p.url ?? '#'} target="_blank" rel="noreferrer" className="underline">
                      {p.title ?? 'Untitled'}
                    </a>
                  </td>
                  <td className="p-3">{p.views ?? 0}</td>
                  <td className="p-3">{p.likes ?? 0}</td>
                  <td className="p-3">{p.comments ?? 0}</td>
                  <td className="p-3">{p.shares ?? 0}</td>
                  <td className="p-3">{(p.engagement_rate ?? 0).toFixed(3)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="p-3" colSpan={6}>No data for this platform in the past 7 days.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">This week's recommendations</h2>
        {insight ? (
          <div className="rounded-2xl border p-4 space-y-2">
            <p className="font-medium">Summary</p>
            <p className="text-sm">{insight.summary}</p>
            <p className="font-medium mt-2">Recommendations</p>
            <p className="text-sm whitespace-pre-wrap">{insight.recommendations}</p>
          </div>
        ) : (
          <div className="text-sm rounded-2xl border p-4">
            No weekly insight yet—seed or generate insights to populate this section.
          </div>
        )}
      </section>
    </div>
  );
}