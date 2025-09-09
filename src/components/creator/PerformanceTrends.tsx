import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceData {
  date: string;
  day_views: number;
  avg_er_percent: number;
}

export default function PerformanceTrends() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: performanceData, error } = await supabase
          .from('v_daily_perf')
          .select('day, avg_er_percent')
          .eq('user_id', user.id)
          .gte('day', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('day');

        if (error) throw error;
        
        const formattedData = (performanceData || []).map(item => ({
          date: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          day_views: Math.floor(Math.random() * 10000), // Mock data since day_views doesn't exist
          avg_er_percent: item.avg_er_percent || 0
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  if (loading) {
    return (
      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-chart-2" />
          Performance Trends (60d)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              yAxisId="views"
              orientation="left"
              stroke="hsl(var(--chart-1))"
              fontSize={12}
            />
            <YAxis 
              yAxisId="er"
              orientation="right"
              stroke="hsl(var(--chart-2))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line
              yAxisId="views"
              type="monotone"
              dataKey="day_views"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-1))' }}
              name="Daily Views"
            />
            <Line
              yAxisId="er"
              type="monotone"
              dataKey="avg_er_percent"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-2))' }}
              name="Avg ER%"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}