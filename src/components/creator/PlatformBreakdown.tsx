import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PlatformData {
  platform: string;
  avg_er: number;
  views: number;
  posts: number;
}

export default function PlatformBreakdown() {
  const [data, setData] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);

  const PLATFORM_COLORS = {
    instagram: '#E1306C',
    tiktok: '#000000',
    youtube: '#FF0000',
    twitter: '#1DA1F2',
    linkedin: '#0077B5',
    facebook: '#1877F2'
  };

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: postsData, error } = await supabase
          .from('v_posts_with_latest')
          .select('platform, engagement_rate, views, created_at, published_at')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (error) throw error;

        // Group by platform and calculate stats
        const platformStats = (postsData || []).reduce((acc, post) => {
          const platform = post.platform;
          if (!acc[platform]) {
            acc[platform] = {
              platform,
              total_er: 0,
              total_views: 0,
              posts: 0
            };
          }
          acc[platform].total_er += post.engagement_rate || 0;
          acc[platform].total_views += post.views || 0;
          acc[platform].posts += 1;
          return acc;
        }, {} as Record<string, any>);

        const platformData = Object.values(platformStats).map((stats: any) => ({
          platform: stats.platform,
          avg_er: Math.round((stats.total_er / stats.posts) * 100) / 100,
          views: stats.total_views,
          posts: stats.posts
        })).sort((a, b) => b.views - a.views);

        setData(platformData);
      } catch (error) {
        console.error('Error fetching platform data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformData();
  }, []);

  const chartData = data.map((item, index) => ({
    ...item,
    color: PLATFORM_COLORS[item.platform.toLowerCase() as keyof typeof PLATFORM_COLORS] || `hsl(var(--chart-${(index % 5) + 1}))`
  }));

  if (loading) {
    return (
      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-chart-5" />
          Platform Breakdown (30d)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="views"
                  nameKey="platform"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ platform, percent }) => 
                    `${platform} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Views']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Table */}
          <div className="space-y-3">
            {chartData.map((platform, index) => (
              <div
                key={platform.platform}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: platform.color }}
                  />
                  <span className="font-medium capitalize">{platform.platform}</span>
                </div>
                <div className="text-right text-sm">
                  <div className="font-bold">{platform.avg_er}% ER</div>
                  <div className="text-muted-foreground">
                    {platform.views.toLocaleString()} views • {platform.posts} posts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {data.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No platform data available for the last 30 days.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}