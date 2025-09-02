// src/components/PlatformCards.tsx
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

// Simple total buckets we want to show
type Totals = { views: number; likes: number; comments: number; shares: number };

async function fetchTotalsLast7d(): Promise<Totals> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Read from the PUBLIC VIEW "post_metrics", which maps to app.post_metrics
  const { data, error } = await supabase
    .from('post_metrics')
    .select('views,likes,comments,shares,published_at')
    .gte('published_at', since);

  if (error) throw new Error(error.message);

  const base: Totals = { views: 0, likes: 0, comments: 0, shares: 0 };
  return (data ?? []).reduce((acc, row) => ({
    views: acc.views + (row.views ?? 0),
    likes: acc.likes + (row.likes ?? 0),
    comments: acc.comments + (row.comments ?? 0),
    shares: acc.shares + (row.shares ?? 0),
  }), base);
}

export default function PlatformCards() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchTotalsLast7d().then(setTotals).catch(e => setErr(e.message));
  }, []);

  if (err) {
    return (
      <div className="rounded-lg border p-4 text-sm text-red-600">
        Error loading totals: {err}
      </div>
    );
  }

  const cards = [
    { label: 'Views',    value: totals?.views ?? 0 },
    { label: 'Likes',    value: totals?.likes ?? 0 },
    { label: 'Comments', value: totals?.comments ?? 0 },
    { label: 'Shares',   value: totals?.shares ?? 0 },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-4">
        Activity (last 7 days)
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-3 sm:p-4 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium px-1 py-0.5 sm:px-2 sm:py-1">
                {c.label}
              </Badge>
            </div>
            <div className="text-sm sm:text-xl font-bold text-foreground">
              {Intl.NumberFormat().format(c.value)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
