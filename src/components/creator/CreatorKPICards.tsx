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
        const { data, error } = await supabase.rpc('get_creator_kpis');
        if (error) throw error;
        
        if (data && data.length > 0) {
          setKpis(data[0]);
        }
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