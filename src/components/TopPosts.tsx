// src/components/TopPosts.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type PostRow = {
  title: string | null;
  url: string | null;
  published_at: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  engagement_rate: number | null;
};

export default function TopPosts() {
  const [rows, setRows] = useState<PostRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from('post_metrics')
      .select('title,url,published_at,views,likes,comments,shares,engagement_rate')
      .gte('published_at', since)
      .order('engagement_rate', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        else setRows(data ?? []);
      });
  }, []);

  if (err) return <div className="rounded-lg border p-4 text-sm text-red-600">Error: {err}</div>;

  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">Top posts (7d)</h2>
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-3">Title</th>
              <th className="p-3">Views</th>
              <th className="p-3">Likes</th>
              <th className="p-3">Comments</th>
              <th className="p-3">Shares</th>
              <th className="p-3">Eng. rate</th>
            </tr>
          </thead>
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
                <td className="p-3">{((p.engagement_rate ?? 0)).toFixed(3)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-3" colSpan={6}>No data yet. Try the **Full Seed** and refresh.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
