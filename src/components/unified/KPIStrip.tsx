import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, BarChart3, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface KPIStripProps {
  filters: {
    from: Date | null;
    to: Date | null;
    platform: string;
  };
}

interface KPIData {
  views_30d: number;
  avg_er_30d: number;
  posts_30d: number;
  active_campaigns: number;
}

export default function KPIStrip({ filters }: KPIStripProps) {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIs();
  }, [filters]);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const { data: kpiData, error } = await supabase.rpc('get_ugc_kpis', {
        p_from: filters.from?.toISOString().split('T')[0] || null,
        p_to: filters.to?.toISOString().split('T')[0] || null,
        p_platform: filters.platform
      });

      if (error) throw error;
      setData(kpiData[0] || { views_30d: 0, avg_er_30d: 0, posts_30d: 0, active_campaigns: 0 });
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      setData({ views_30d: 0, avg_er_30d: 0, posts_30d: 0, active_campaigns: 0 });
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      id: 'kpi-views',
      title: 'Total Views',
      value: data?.views_30d?.toLocaleString() || '0',
      icon: Eye,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'kpi-er',
      title: 'Avg. ER',
      value: data?.avg_er_30d ? `${data.avg_er_30d}%` : '0%',
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'kpi-posts',
      title: 'Posts',
      value: data?.posts_30d?.toString() || '0',
      icon: BarChart3,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'kpi-campaigns',
      title: 'Active Campaigns',
      value: data?.active_campaigns?.toString() || '0',
      icon: Briefcase,
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card key={card.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${card.gradient}`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="h-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full mt-3" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}