import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PlatformData {
  platform: string;
  avg_er: number;
  views: number;
  posts: number;
}

export default function PlatformBreakdown() {
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformBreakdown = async () => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from('v_posts_with_latest')
          .select('platform, views, engagement_rate')
          .gte('published_at', thirtyDaysAgo);

        if (error) throw error;

        // Group by platform
        const grouped = (data || []).reduce((acc, post) => {
          const platform = post.platform || 'Unknown';
          if (!acc[platform]) {
            acc[platform] = { views: 0, engagement_rates: [], posts: 0 };
          }
          acc[platform].views += post.views || 0;
          acc[platform].engagement_rates.push(post.engagement_rate || 0);
          acc[platform].posts += 1;
          return acc;
        }, {} as Record<string, any>);

        const breakdown = Object.entries(grouped).map(([platform, stats]) => ({
          platform,
          avg_er: stats.engagement_rates.length 
            ? Math.round((stats.engagement_rates.reduce((sum: number, er: number) => sum + er, 0) / stats.engagement_rates.length) * 100) / 100
            : 0,
          views: stats.views,
          posts: stats.posts
        })).sort((a, b) => b.views - a.views);

        setPlatformData(breakdown);
      } catch (error) {
        console.error('Error fetching platform breakdown:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformBreakdown();
  }, []);

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'tiktok': return 'bg-pink-500/10 text-pink-700 dark:text-pink-300';
      case 'instagram': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'youtube': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Platform Breakdown (30d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Platform Breakdown (30d)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {platformData.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No platform data</p>
            <p className="text-sm text-muted-foreground">Create content to see platform breakdown</p>
          </div>
        ) : (
          <div className="space-y-4">
            {platformData.map((platform, index) => (
              <div key={platform.platform} className="p-4 rounded-lg border bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className={getPlatformColor(platform.platform)}>
                    {platform.platform}
                  </Badge>
                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Avg ER%</p>
                    <p className="font-mono font-medium">{platform.avg_er.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Views</p>
                    <p className="font-mono font-medium">{platform.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Posts</p>
                    <p className="font-mono font-medium">{platform.posts}</p>
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