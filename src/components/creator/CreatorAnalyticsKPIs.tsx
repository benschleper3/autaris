import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, TrendingUp, FileText, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface KPIData {
  views_30d: number;
  avg_er_30d: number;
  posts_30d: number;
  top_post_er_30d: number;
}

export default function CreatorAnalyticsKPIs() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        // Get user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch posts from last 30 days
        const { data: posts, error } = await supabase
          .from('v_posts_with_latest')
          .select('views, engagement_rate, created_at, published_at')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (error) throw error;

        // Calculate KPIs
        const recentPosts = posts?.filter(post => {
          const postDate = new Date(post.published_at || post.created_at);
          return postDate >= thirtyDaysAgo;
        }) || [];

        const views30d = recentPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        const avgEr30d = recentPosts.length > 0 
          ? recentPosts.reduce((sum, post) => sum + (post.engagement_rate || 0), 0) / recentPosts.length
          : 0;
        const posts30d = recentPosts.length;
        const topPostEr30d = Math.max(...recentPosts.map(post => post.engagement_rate || 0), 0);

        setKpis({
          views_30d: views30d,
          avg_er_30d: Math.round(avgEr30d * 100) / 100,
          posts_30d: posts30d,
          top_post_er_30d: Math.round(topPostEr30d * 100) / 100
        });
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Views (30d)",
      value: kpis?.views_30d?.toLocaleString() || "0",
      icon: <Eye className="w-5 h-5" />,
      color: "text-chart-1"
    },
    {
      title: "Avg ER% (30d)",
      value: `${kpis?.avg_er_30d || 0}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-chart-2"
    },
    {
      title: "Posts (30d)",
      value: kpis?.posts_30d?.toString() || "0",
      icon: <FileText className="w-5 h-5" />,
      color: "text-chart-3"
    },
    {
      title: "Top Post ER% (30d)",
      value: `${kpis?.top_post_er_30d || 0}%`,
      icon: <Zap className="w-5 h-5" />,
      color: "text-chart-4"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((kpi, index) => (
        <Card 
          key={index}
          className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className={kpi.color}>{kpi.icon}</span>
              {kpi.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
            {/* Mini sparkline placeholder */}
            <div className="mt-2 h-8 w-full bg-gradient-to-r from-chart-1/20 via-chart-2/20 to-chart-3/20 rounded opacity-50" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}