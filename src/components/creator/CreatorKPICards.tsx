import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MetricCard from '@/components/MetricCard';
import { Users, Phone, UserCheck, DollarSign } from 'lucide-react';

export default function CreatorKPICards() {
  const [kpis, setKpis] = useState({
    leads_7d: 0,
    calls_7d: 0,
    clients_30d: 0,
    revenue_30d: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        // Query each KPI separately since the RPC might not be available yet
        const [leadsResult, callsResult, clientsResult, revenueResult] = await Promise.all([
          supabase.from('crm_leads').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('crm_bookings').select('id', { count: 'exact' }).gte('starts_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('crm_opportunities').select('id', { count: 'exact' }).eq('won', true).gte('close_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
          supabase.from('crm_opportunities').select('value_cents').eq('won', true).gte('close_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        ]);
        
        const revenue = (revenueResult.data || []).reduce((sum, item) => sum + (item.value_cents || 0), 0) / 100;
        
        setKpis({
          leads_7d: leadsResult.count || 0,
          calls_7d: callsResult.count || 0,
          clients_30d: clientsResult.count || 0,
          revenue_30d: revenue
        });
      } catch (error) {
        console.error('Error fetching creator KPIs:', error);
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
        title="Leads (7d)"
        value={kpis.leads_7d.toString()}
        change="+12%"
        changeType="positive"
        icon={<Users className="w-4 h-4" />}
      />
      <MetricCard
        title="Calls (7d)"
        value={kpis.calls_7d.toString()}
        change="+8%"
        changeType="positive"
        icon={<Phone className="w-4 h-4" />}
      />
      <MetricCard
        title="New Clients (30d)"
        value={kpis.clients_30d.toString()}
        change="+15%"
        changeType="positive"
        icon={<UserCheck className="w-4 h-4" />}
      />
      <MetricCard
        title="Revenue (30d)"
        value={`$${kpis.revenue_30d.toLocaleString()}`}
        change="+22%"
        changeType="positive"
        icon={<DollarSign className="w-4 h-4" />}
      />
    </div>
  );
}