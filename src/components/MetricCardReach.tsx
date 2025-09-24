import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const fmt = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

export default function MetricCardReach() {
  const [data, setData] = useState<{ weekly_reach: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // SupabaseQuery configuration
  const dataConfig = {
    kind: "SupabaseQuery",
    sql: `
      select sum(coalesce(ps.reach_7d,0)) as weekly_reach
      from public.platform_stats ps
      where ps.user_id = auth.uid();
    `
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use posts view to get weekly reach
        const { data: queryData, error } = await supabase
          .from('v_posts_with_latest')
          .select('views')
          .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
        if (error) throw error;
        
        const weeklyReach = queryData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
        setData({ weekly_reach: weeklyReach });
      } catch (err) {
        console.error('Error fetching reach:', err);
        setData({ weekly_reach: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayValue = data ? fmt(data.weekly_reach) : '0';

  return (
    <Card className={cn("p-3 sm:p-4 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-growth-primary/20 hover:bg-card/80 cursor-pointer")}>
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Weekly Reach</p>
        <div className="text-muted-foreground">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      
      <div className="flex items-end gap-2">
        <h3 className="text-lg sm:text-2xl font-bold text-foreground">
          {loading ? '...' : displayValue}
        </h3>
        <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-growth-success">
          <TrendingUp className="w-3 h-3" />
          {/* Change calculation would need historical data */}
          +0%
        </div>
      </div>
    </Card>
  );
}