import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MetricCard from '@/components/MetricCard';
import { Eye, TrendingUp, FileText, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface KPIData {
  views_30d: number;
  avg_er_30d: number;
  posts_30d: number;
  active_campaigns: number;
}

export default function UGCKPICards() {
  const [kpis, setKpis] = useState<KPIData>({
    views_30d: 0,
    avg_er_30d: 0,
    posts_30d: 0,
    active_campaigns: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        // Fetch 30d data from posts
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const { data: postsData, error: postsError } = await supabase
          .from('v_posts_with_latest')
          .select('views, engagement_rate')
          .gte('published_at', thirtyDaysAgo);

        if (postsError) throw postsError;

        // Fetch active campaigns
        const today = new Date().toISOString().split('T')[0];
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id', { count: 'exact' })
          .lte('start_date', today)
          .gte('end_date', today);

        if (campaignsError) throw campaignsError;

        const totalViews = (postsData || []).reduce((sum, item) => sum + (item.views || 0), 0);
        const avgER = postsData?.length 
          ? (postsData.reduce((sum, item) => sum + (item.engagement_rate || 0), 0) / postsData.length)
          : 0;
        
        setKpis({
          views_30d: totalViews,
          avg_er_30d: Math.round(avgER * 100) / 100,
          posts_30d: postsData?.length || 0,
          active_campaigns: campaignsData?.length || 0
        });
      } catch (error) {
        console.error('Error fetching UGC KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Views (30d)"
        value={kpis.views_30d.toLocaleString()}
        change="+12%"
        changeType="positive"
        icon={<Eye className="w-4 h-4" />}
      />
      <MetricCard
        title="Avg ER% (30d)"
        value={`${kpis.avg_er_30d}%`}
        change="+2.1%"
        changeType="positive"
        icon={<TrendingUp className="w-4 h-4" />}
      />
      <MetricCard
        title="Posts (30d)"
        value={kpis.posts_30d.toString()}
        change="+3"
        changeType="positive"
        icon={<FileText className="w-4 h-4" />}
      />
      <MetricCard
        title="Active Campaigns"
        value={kpis.active_campaigns.toString()}
        change="+1"
        changeType="positive"
        icon={<Target className="w-4 h-4" />}
      />
    </div>
  );
}