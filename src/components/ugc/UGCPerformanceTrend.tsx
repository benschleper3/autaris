import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';

interface Filters {
  from: Date | null;
  to: Date | null;
  platform: string | null;
}

interface TrendData {
  date: string;
  day_views: number;
  avg_er_percent: number;
}

interface Props {
  filters: Filters;
}

export default function UGCPerformanceTrend({ filters }: Props) {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        let fromDate = filters.from?.toISOString().split('T')[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        let toDate = filters.to?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];

        const { data: trendData, error } = await supabase.rpc('get_daily_perf', {
          p_from: fromDate,
          p_to: toDate,
          p_platform: filters.platform || 'all'
        });

        if (error) {
          console.error('Error fetching trend data:', error);
          setData([]);
        } else {
          const formatted = (trendData || []).map((item, index) => ({
            date: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            day_views: Math.round(item.day_views || 0),
            avg_er_percent: Math.round((item.avg_er_percent || 0) * 100) / 100
          }));
          setData(formatted);
        }
      } catch (error) {
        console.error('Error:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [filters]);

  if (loading) {
    return <Skeleton className="h-80 rounded-2xl" />;
  }

  return (
    <Card id="chart-trend" className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Performance Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No trend data available for the selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="date" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="day_views" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Daily Views"
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avg_er_percent" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name="Avg ER%"
                dot={{ fill: 'hsl(var(--accent))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}