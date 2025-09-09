import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MetricCard from '@/components/MetricCard';
import { Eye, TrendingUp, Briefcase, DollarSign } from 'lucide-react';

export default function UGCKPICards() {
  const [kpis, setKpis] = useState({
    views_30d: 0,
    avg_er_30d: 0,
    active_campaigns: 0,
    revenue_mtd: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        // Query each KPI separately
        const [viewsResult, erResult, campaignsResult, revenueResult] = await Promise.all([
          supabase.from('post_metrics').select('views').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('post_metrics').select('engagement_rate').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('campaigns').select('id', { count: 'exact' }).lte('start_date', new Date().toISOString().split('T')[0]).gte('end_date', new Date().toISOString().split('T')[0]),
          supabase.from('creator_revenue').select('amount_cents').gte('paid_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        ]);
        
        const totalViews = (viewsResult.data || []).reduce((sum, item) => sum + (item.views || 0), 0);
        const avgER = (erResult.data || []).reduce((sum, item, _, arr) => sum + (item.engagement_rate || 0) / arr.length, 0);
        const revenueThisMonth = (revenueResult.data || []).reduce((sum, item) => sum + (item.amount_cents || 0), 0) / 100;
        
        setKpis({
          views_30d: totalViews,
          avg_er_30d: Math.round(avgER * 100) / 100,
          active_campaigns: campaignsResult.count || 0,
          revenue_mtd: revenueThisMonth
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
          <div key={i} className="h-24 bg-card/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Views (30d)"
        value={kpis.views_30d.toLocaleString()}
        change="+18%"
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
        title="Active Campaigns"
        value={kpis.active_campaigns.toString()}
        change="+1"
        changeType="positive"
        icon={<Briefcase className="w-4 h-4" />}
      />
      <MetricCard
        title="Revenue (MTD)"
        value={`$${kpis.revenue_mtd.toLocaleString()}`}
        change="+25%"
        changeType="positive"
        icon={<DollarSign className="w-4 h-4" />}
      />
    </div>
  );
}