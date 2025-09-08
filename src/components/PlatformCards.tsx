// src/components/PlatformCards.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { FaInstagram, FaYoutube, FaXTwitter, FaLinkedin, FaFacebook, FaTiktok } from 'react-icons/fa6';
import { supabase } from '@/lib/config';

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

const fmt = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

interface PlatformData {
  platform: string;
  followers: number;
  reach_7d: number;
  posts_7d: number;
}

export default function PlatformCards() {
  const [data, setData] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SupabaseQuery configuration
  const dataConfig = {
    kind: "SupabaseQuery",
    sql: `
      select
        ps.platform,
        coalesce(ps.followers, 0) as followers,
        coalesce(ps.reach_7d, 0)  as reach_7d,
        count(distinct p.id) filter (where p.status='published'
          and coalesce(p.published_at, p.created_at) >= now() - interval '7 days') as posts_7d
      from public.platform_stats ps
      left join public.social_accounts sa
        on sa.user_id = ps.user_id and sa.platform = ps.platform
      left join public.posts p
        on p.user_id = ps.user_id and p.social_account_id = sa.id
      where ps.user_id = auth.uid()
      group by ps.platform, ps.followers, ps.reach_7d
      order by ps.platform;
    `
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using direct SQL query since we don't have the exact table structure yet
        const { data: queryData, error } = await supabase
          .from('platform_stats')
          .select('platform, followers, reach_7d')
          .order('platform');
        
        if (error) throw error;
        
        // Transform data to match expected format
        const platformData = queryData?.map(item => ({
          platform: item.platform,
          followers: item.followers || 0,
          reach_7d: item.reach_7d || 0,
          posts_7d: 0 // Default for now
        })) || [];
        
        setData(platformData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch platform data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const navigateToPlatform = (platform: string) => {
    // Navigate to platform details
    window.location.href = `/platform/${platform}`;
  };

  if (error) return <div className="rounded-lg border p-4 text-sm text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-4">
        Platform Analytics (last 7 days)
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {data.length > 0 ? data.map((item) => {
          const platformKey = item.platform.toLowerCase() as PlatformKey;
          const meta = PLATFORM_META[platformKey];
          
          if (!meta) return null;

          return (
            <div key={item.platform} onClick={() => navigateToPlatform(item.platform)} className="cursor-pointer">
              <Card className="p-2 sm:p-3 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 hover:bg-card/80">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className={cn('w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-gradient-to-r flex items-center justify-center text-white', meta.color)}>
                    <meta.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{meta.name}</span>
                </div>

                <div className="space-y-0.5 sm:space-y-1">
                  <h4 className="text-sm sm:text-lg font-bold text-foreground">
                    {fmt(item.followers)}
                  </h4>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    {fmt(item.reach_7d)} reach • {item.posts_7d} posts
                  </div>
                </div>
              </Card>
            </div>
          );
        }) : (
          Object.keys(PLATFORM_META).map((key) => {
            const meta = PLATFORM_META[key as PlatformKey];
            return (
              <div key={key} onClick={() => navigateToPlatform(key)} className="cursor-pointer">
                <Card className="p-2 sm:p-3 border-border/50 bg-card/50 backdrop-blur-sm opacity-50">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <div className={cn('w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-gradient-to-r flex items-center justify-center text-white', meta.color)}>
                      <meta.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{meta.name}</span>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <h4 className="text-sm sm:text-lg font-bold text-foreground">0</h4>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">No data</div>
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>

      {loading && <div className="text-xs text-muted-foreground">Loading platform metrics…</div>}
    </div>
  );
}