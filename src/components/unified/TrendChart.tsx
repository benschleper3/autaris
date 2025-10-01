import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendChartProps {
  filters: {
    from: Date | null;
    to: Date | null;
    platform: string;
  };
}

interface TrendData {
  date: string;
  day_views: number;
  avg_er_percent: number;
}

export default function TrendChart({ filters }: TrendChartProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, [filters]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.from) params.set('from', filters.from.toISOString().split('T')[0]);
      if (filters.to) params.set('to', filters.to.toISOString().split('T')[0]);
      params.set('platform', filters.platform);

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://gjfbxqsjxasubvnpeeie.supabase.co/functions/v1/analytics-trend?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      if (!data.ok) throw new Error(data.error);

      const formattedData = (data.rows || []).map((item: any) => ({
        date: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        day_views: item.day_views || 0,
        avg_er_percent: item.avg_er_percent || 0
      }));

      setData(formattedData);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No trend data available for the selected filters
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full" id="chart-trend">
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
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
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
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
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avg_er_percent"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              name="Avg ER%"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}