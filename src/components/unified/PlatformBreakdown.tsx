import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface PlatformBreakdownProps {
  filters: {
    from: Date | null;
    to: Date | null;
    platform: string;
  };
}

interface PlatformData {
  platform: string;
  avg_er: number;
  views: number;
  posts: number;
}

export default function PlatformBreakdown({ filters }: PlatformBreakdownProps) {
  const [data, setData] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformData();
  }, [filters]);

  const fetchPlatformData = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('v_posts_with_latest')
        .select('platform, engagement_rate, views')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      // Apply filters
      if (filters.platform !== 'all') {
        query = query.eq('platform', filters.platform as any);
      }

      if (filters.from || filters.to) {
        if (filters.from && filters.to) {
          query = query.gte('created_at', filters.from.toISOString())
                       .lte('created_at', filters.to.toISOString());
        } else if (filters.from) {
          query = query.gte('created_at', filters.from.toISOString());
        } else if (filters.to) {
          query = query.lte('created_at', filters.to.toISOString());
        }
      }

      const { data: posts, error } = await query;

      if (error) throw error;

      // Group by platform and calculate aggregates
      const platformMap = new Map<string, { total_views: number; total_er: number; count: number }>();

      posts?.forEach(post => {
        const platform = post.platform;
        // Skip posts without a valid platform
        if (!platform || platform === 'unknown') return;
        
        const existing = platformMap.get(platform) || { total_views: 0, total_er: 0, count: 0 };
        
        platformMap.set(platform, {
          total_views: existing.total_views + (post.views || 0),
          total_er: existing.total_er + (post.engagement_rate || 0),
          count: existing.count + 1
        });
      });

      const platformData: PlatformData[] = Array.from(platformMap.entries())
        .map(([platform, stats]) => ({
          platform,
          avg_er: stats.count > 0 ? Math.round((stats.total_er / stats.count) * 100) / 100 : 0,
          views: stats.total_views,
          posts: stats.count
        }))
        .sort((a, b) => b.views - a.views);

      setData(platformData);
    } catch (error) {
      console.error('Error fetching platform data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      tiktok: 'bg-pink-500',
      instagram: 'bg-purple-500',
      youtube: 'bg-red-500',
      twitter: 'bg-blue-500',
      unknown: 'bg-gray-500'
    };
    return colors[platform.toLowerCase() as keyof typeof colors] || colors.unknown;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex gap-4 text-sm">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card id="platform-breakdown">
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No platform data available for the selected filters
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="platform-breakdown">
      <CardHeader>
        <CardTitle>Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((platform) => (
          <div key={platform.platform} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Badge className={`${getPlatformColor(platform.platform)} text-white`}>
                {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}
              </Badge>
              <span className="font-medium">Avg ER: {platform.avg_er}%</span>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{platform.views.toLocaleString()} views</span>
              <span>{platform.posts} posts</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}