import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers } from 'lucide-react';

interface Filters {
  from: Date | null;
  to: Date | null;
  platform: string | null;
}

interface PlatformData {
  platform: string;
  avg_er: number;
  views: number;
  posts: number;
}

interface Props {
  filters: Filters;
}

export default function UGCPlatformBreakdown({ filters }: Props) {
  const [data, setData] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformData = async () => {
      setLoading(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        let query = supabase
          .from('v_posts_with_latest')
          .select('platform, engagement_rate, views')
          .eq('user_id', user.user.id);

        if (filters.platform) {
          query = query.eq('platform', filters.platform as any);
        }

        if (filters.from && filters.to) {
          query = query
            .gte('published_at', filters.from.toISOString())
            .lte('published_at', filters.to.toISOString());
        }

        const { data: postsData, error } = await query;

        if (error) {
          console.error('Error fetching platform data:', error);
          setData([]);
        } else {
          // Group by platform and calculate metrics
          const platformMap = new Map<string, { totalViews: number; totalEngagement: number; posts: number }>();
          
          (postsData || []).forEach(post => {
            const platform = post.platform || 'unknown';
            const current = platformMap.get(platform) || { totalViews: 0, totalEngagement: 0, posts: 0 };
            
            platformMap.set(platform, {
              totalViews: current.totalViews + (post.views || 0),
              totalEngagement: current.totalEngagement + (post.engagement_rate || 0),
              posts: current.posts + 1
            });
          });

          const formatted = Array.from(platformMap.entries()).map(([platform, metrics]) => ({
            platform,
            avg_er: metrics.posts > 0 ? Math.round((metrics.totalEngagement / metrics.posts) * 100) / 100 : 0,
            views: metrics.totalViews,
            posts: metrics.posts
          })).sort((a, b) => b.views - a.views);

          setData(formatted);
        }
      } catch (error) {
        console.error('Error:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformData();
  }, [filters]);

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'tiktok': return 'bg-pink-500/10 text-pink-700 dark:text-pink-300';
      case 'instagram': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'youtube': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  return (
    <Card id="platform-breakdown" className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Platform Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">No platform data available</div>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((platform) => (
              <div key={platform.platform} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={getPlatformColor(platform.platform)}>
                    {platform.platform || 'Unknown'}
                  </Badge>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Avg ER:</span>
                      <span className="font-medium ml-1">{platform.avg_er}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Views:</span>
                      <span className="font-medium ml-1">{platform.views.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Posts:</span>
                      <span className="font-medium ml-1">{platform.posts}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}