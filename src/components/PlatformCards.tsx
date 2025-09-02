// src/components/PlatformCards.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { FaInstagram, FaYoutube, FaXTwitter, FaLinkedin, FaFacebook, FaTiktok } from 'react-icons/fa6';
import { supabase } from '@/lib/supabase';

type Totals = { views: number; likes: number; comments: number; shares: number };
type Growth = { pct: number; direction: 'positive' | 'negative' | 'flat' };
type PlatformKey = 'instagram' | 'youtube' | 'twitter' | 'linkedin' | 'facebook' | 'tiktok';

type PlatformMeta = {
  key: PlatformKey;
  name: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  unit: string;
};

const PLATFORM_META: Record<PlatformKey, PlatformMeta> = {
  instagram: { key: 'instagram', name: 'INSTAGRAM', color: 'from-pink-500 to-orange-500', icon: FaInstagram, unit: 'Followers' },
  youtube:   { key: 'youtube',   name: 'YOUTUBE',   color: 'from-red-500 to-red-600',     icon: FaYoutube,   unit: 'Subscribers' },
  twitter:   { key: 'twitter',   name: 'X',         color: 'from-gray-600 to-black',      icon: FaXTwitter,  unit: 'Followers' },
  linkedin:  { key: 'linkedin',  name: 'LINKEDIN',  color: 'from-blue-600 to-blue-700',   icon: FaLinkedin,  unit: 'Followers' },
  facebook:  { key: 'facebook',  name: 'FACEBOOK',  color: 'from-blue-500 to-blue-600',   icon: FaFacebook,  unit: 'Followers' },
  tiktok:    { key: 'tiktok',    name: 'TIKTOK',    color: 'from-gray-800 to-gray-900',   icon: FaTiktok,    unit: 'Followers' },
};

const sumEngagement = (t: Totals) => (t.likes || 0) + (t.comments || 0) + (t.shares || 0);
const fmt = (n: number) => Intl.NumberFormat().format(Math.max(0, Math.floor(n)));

async function fetchPerPlatform(): Promise<{ now: Record<PlatformKey, Totals>; prev: Record<PlatformKey, Totals>; }> {
  const nowEnd = new Date();
  const nowStart = new Date(nowEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prevStart = new Date(nowStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const nowIsoStart = nowStart.toISOString();
  const nowIsoEnd = nowEnd.toISOString();
  const prevIsoStart = prevStart.toISOString();
  const prevIsoEnd = nowStart.toISOString();

  // Map account id -> platform
  const { data: accounts, error: accErr } = await supabase
    .from('social_accounts') // public view -> app.social_accounts
    .select('id, platform');
  if (accErr) throw new Error(accErr.message);

  const idToPlatform = new Map<number, PlatformKey>();
  for (const a of accounts ?? []) {
    const p = (a.platform as string) as PlatformKey;
    if (p && PLATFORM_META[p]) idToPlatform.set(a.id as number, p);
  }

  // Helper to bucket a time window by platform
  const getWindowTotals = async (fromISO: string, toISO: string) => {
    const { data, error } = await supabase
      .from('post_metrics') // public view -> app.post_metrics
      .select('social_account_id, views, likes, comments, shares, published_at')
      .gte('published_at', fromISO)
      .lt('published_at', toISO);
    if (error) throw new Error(error.message);

    const zero: Totals = { views: 0, likes: 0, comments: 0, shares: 0 };
    const byPlatform: Record<PlatformKey, Totals> = {
      instagram: { ...zero }, youtube: { ...zero }, twitter: { ...zero },
      linkedin: { ...zero }, facebook: { ...zero }, tiktok: { ...zero },
    };

    for (const r of data ?? []) {
      const platform = idToPlatform.get(r.social_account_id as number);
      if (!platform) continue;
      byPlatform[platform].views    += r.views ?? 0;
      byPlatform[platform].likes    += r.likes ?? 0;
      byPlatform[platform].comments += r.comments ?? 0;
      byPlatform[platform].shares   += r.shares ?? 0;
    }
    return byPlatform;
  };

  const [nowTotals, prevTotals] = await Promise.all([
    getWindowTotals(nowIsoStart, nowIsoEnd),
    getWindowTotals(prevIsoStart, prevIsoEnd),
  ]);

  return { now: nowTotals, prev: prevTotals };
}

function growthPct(curr: number, prev: number): Growth {
  if (!prev && !curr) return { pct: 0, direction: 'flat' };
  if (!prev) return { pct: 100, direction: 'positive' };
  const pct = ((curr - prev) / Math.max(prev, 1)) * 100;
  return { pct, direction: pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'flat' };
}

export default function PlatformCards() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [totals, setTotals] = useState<Record<PlatformKey, Totals> | null>(null);
  const [growth, setGrowth] = useState<Record<PlatformKey, Growth> | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchPerPlatform()
      .then(({ now, prev }) => {
        if (!mounted) return;
        setTotals(now);
        const g: Record<PlatformKey, Growth> = {} as any;
        (Object.keys(PLATFORM_META) as PlatformKey[]).forEach((k) => {
          const currEng = sumEngagement(now[k]);
          const prevEng = sumEngagement(prev[k]);
          g[k] = growthPct(currEng, prevEng);
        });
        setGrowth(g);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (err) return <div className="rounded-lg border p-4 text-sm text-red-600">Error: {err}</div>;

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-4">
        Platform Analytics (last 7 days)
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {(Object.keys(PLATFORM_META) as PlatformKey[]).map((key) => {
          const meta = PLATFORM_META[key];
          const t: Totals = totals?.[key] ?? { views: 0, likes: 0, comments: 0, shares: 0 };
          const eng = sumEngagement(t);
          const g = growth?.[key] ?? { pct: 0, direction: 'flat' };
          const TrendIcon = g.direction === 'negative' ? TrendingDown : TrendingUp;

          return (
            <Link key={key} to={`/platform/${key}`} className="block">
              <Card className="aspect-square p-2 sm:p-3 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 hover:bg-card/80 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <div className={cn('w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gradient-to-r flex items-center justify-center text-white', meta.color)}>
                    <meta.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                  <Badge variant="secondary" className="text-[9px] sm:text-[10px] font-medium px-1 py-0.5">{meta.name}</Badge>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-0.5">
                  <h4 className="text-xs sm:text-lg font-bold text-foreground">
                    {fmt(eng)}
                  </h4>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">
                    Engagement
                  </p>
                  <div className={cn('flex items-center gap-1 text-[10px] font-medium', g.direction === 'negative' ? 'text-red-600' : 'text-green-600')}>
                    <TrendIcon className="w-2 h-2" />
                    {`${g.pct.toFixed(1)}%`}
                  </div>
                </div>

                <div className="mt-1 text-[9px] sm:text-[10px] text-muted-foreground">
                  Views: {fmt(t.views)} · Likes: {fmt(t.likes)}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {loading && <div className="text-xs text-muted-foreground">Loading platform metrics…</div>}
    </div>
  );
}