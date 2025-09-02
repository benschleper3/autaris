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
    <section className="space-y-2 sm:space-y-3">
      <h2 className="text-lg sm:text-xl font-semibold">Top posts (7d)</h2>
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2 sm:p-3 min-w-[120px]">Title</th>
              <th className="p-2 sm:p-3 text-center">Views</th>
              <th className="p-2 sm:p-3 text-center">Likes</th>
              <th className="p-2 sm:p-3 text-center hidden sm:table-cell">Comments</th>
              <th className="p-2 sm:p-3 text-center hidden sm:table-cell">Shares</th>
              <th className="p-2 sm:p-3 text-center">Eng. rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 sm:p-3">
                  <a href={p.url ?? '#'} target="_blank" rel="noreferrer" className="underline text-xs sm:text-sm hover:text-primary">
                    {p.title ? (p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title) : 'Untitled'}
                  </a>
                </td>
                <td className="p-2 sm:p-3 text-center">{p.views ?? 0}</td>
                <td className="p-2 sm:p-3 text-center">{p.likes ?? 0}</td>
                <td className="p-2 sm:p-3 text-center hidden sm:table-cell">{p.comments ?? 0}</td>
                <td className="p-2 sm:p-3 text-center hidden sm:table-cell">{p.shares ?? 0}</td>
                <td className="p-2 sm:p-3 text-center">{((p.engagement_rate ?? 0) * 100).toFixed(1)}%</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-2 sm:p-3 text-center text-muted-foreground" colSpan={6}>No data yet. Try the **Full Seed** and refresh.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
