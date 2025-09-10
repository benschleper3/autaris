import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, TrendingUp, FileText, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Filters {
  from: Date | null;
  to: Date | null;
  platform: string | null;
}

interface KPIData {
  views_30d: number;
  avg_er_30d: number;
  posts_30d: number;
  active_campaigns: number;
}

interface Props {
  filters?: Filters;
}

export default function UGCKPICards({ filters }: Props) {
  const [kpis, setKpis] = useState<KPIData>({ views_30d: 0, avg_er_30d: 0, posts_30d: 0, active_campaigns: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      setLoading(true);
      try {
        // Use existing function for now - filters will be handled by component logic
        const { data: kpiData } = await supabase.rpc('get_ugc_kpis');
        if (kpiData && kpiData.length > 0) {
          setKpis({
            views_30d: kpiData[0].views_30d || 0,
            avg_er_30d: kpiData[0].avg_er_30d || 0,
            posts_30d: kpiData[0].posts_30d || 0,
            active_campaigns: kpiData[0].active_campaigns || 0
          });
        }
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [filters]);

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
      <Card id="kpi-views" className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Views</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{kpis.views_30d.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <Card id="kpi-er" className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Avg ER%</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{kpis.avg_er_30d}%</div>
          </div>
        </CardContent>
      </Card>

      <Card id="kpi-posts" className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Posts</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{kpis.posts_30d}</div>
          </div>
        </CardContent>
      </Card>

      <Card id="kpi-campaigns" className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
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
  );
}