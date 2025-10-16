import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp, FileText, Target, Calendar, Sparkles, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface KPIData {
  views_30d: number;
  avg_er_30d: number;
  posts_30d: number;
  active_campaigns: number;
}

interface HeatmapData {
  platform: string;
  dow: number;
  hour: number;
  avg_engagement_percent: number;
}

interface PostData {
  post_id: string;
  title: string;
  platform: string;
  published_at: string;
  views: number;
  engagement_rate: number;
}

interface InsightData {
  week_start: string;
  insight: string;
  confidence: number;
}

export default function UGCDashboard() {
  const [kpis, setKpis] = useState<KPIData>({ views_30d: 0, avg_er_30d: 0, posts_30d: 0, active_campaigns: 0 });
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [bestPosts, setBestPosts] = useState<PostData[]>([]);
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeUserRole = async () => {
      try {
        // Check if user has a role set, if not set to ugc_creator
        const { data: userMeta } = await supabase
          .from('user_meta')
          .select('role')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .maybeSingle();

        if (!userMeta) {
          await supabase.rpc('set_user_role', { p_role: 'ugc_creator' } as any);
        }
      } catch (error) {
        console.error('Error initializing user role:', error);
      }
    };

    const fetchDashboardData = async () => {
      try {
        // Fetch KPIs
        const { data: kpiData } = await supabase.rpc('get_ugc_kpis');
        if (kpiData && kpiData.length > 0) {
          setKpis(kpiData[0]);
        }

        // Fetch heatmap data
        const { data: heatmap } = await supabase
          .from('v_time_heatmap')
          .select('platform, dow, hour, avg_engagement_percent')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
        
        setHeatmapData(heatmap || []);

        // Fetch best posts
        const { data: posts } = await supabase
          .from('v_posts_with_latest')
          .select('post_id, title, platform, published_at, created_at, views, engagement_rate')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('engagement_rate', { ascending: false })
          .limit(15);

        setBestPosts(posts?.map(post => ({
          ...post,
          published_at: post.published_at || post.created_at
        })) || []);

        // Fetch insights
        const { data: insightsData } = await supabase
          .from('weekly_insights')
          .select('week_start, summary, recommendations')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .order('week_start', { ascending: false })
          .limit(5);

        setInsights(insightsData?.map(item => ({
          week_start: item.week_start,
          insight: item.summary || 'No insights available',
          confidence: 85 // Mock confidence score
        })) || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUserRole();
    fetchDashboardData();
  }, []);

  const generateInsights = async () => {
    toast({
      title: "Generating Insights",
      description: "AI insights generation coming soon",
    });
  };

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
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          UGC Creator Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Analytics to help you create better content for brands</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Views (30d)</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{kpis.views_30d.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Avg ER% (30d)</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{kpis.avg_er_30d}%</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Posts (30d)</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{kpis.posts_30d}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Active Campaigns</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{kpis.active_campaigns}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Time to Post */}
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Best Time to Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            {heatmapData.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No timing data yet</p>
                <p className="text-sm text-muted-foreground">Post content to see optimal timing</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Heatmap visualization coming soon</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Quick Insights
              </CardTitle>
              <Button onClick={generateInsights} size="sm" variant="outline">
                Generate Insights
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No insights yet</p>
                <p className="text-sm text-muted-foreground">Generate AI insights to improve your content</p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="p-3 bg-background/50 rounded-lg border">
                    <p className="text-sm">{insight.insight}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Week of {new Date(insight.week_start).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Best Posts */}
      <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Best Performing Posts (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No posts yet</p>
              <p className="text-sm text-muted-foreground">Connect your social accounts to see performance data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">ER%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestPosts.map((post) => (
                    <TableRow key={post.post_id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {post.title || 'Untitled Post'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getPlatformColor(post.platform)}>
                          {post.platform || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {post.published_at 
                          ? new Date(post.published_at).toLocaleDateString()
                          : 'Draft'
                        }
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {post.views.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {post.engagement_rate.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}