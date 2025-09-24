import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface ActivityData {
  day_name: string;
  followers: number; // This will be views but labeled as followers for chart compatibility
  engagement: number;
}

export default function ActivityChart() {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  // SupabaseQuery configuration
  const dataConfig = {
    kind: "SupabaseQuery",
    sql: `
      select
        to_char(day, 'Dy') as day_name,
        sum(day_views)       as followers,   -- label this series "Views" in the chart
        avg(avg_er_percent)  as engagement   -- average ER% that day
      from public.v_daily_perf
      where user_id = auth.uid() and day >= current_date - interval '6 days'
      group by day
      order by day;
    `
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fallback data for now since we don't have the exact table structure
        const fallbackData = [
          { day_name: 'Mon', followers: 2400, engagement: 1400 },
          { day_name: 'Tue', followers: 2210, engagement: 1600 },
          { day_name: 'Wed', followers: 2290, engagement: 1800 },
          { day_name: 'Thu', followers: 2000, engagement: 2200 },
          { day_name: 'Fri', followers: 2181, engagement: 2400 },
          { day_name: 'Sat', followers: 2500, engagement: 2100 },
          { day_name: 'Sun', followers: 2100, engagement: 2300 },
        ];
        
        setData(fallbackData);
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="p-3 sm:p-4 lg:p-6 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-growth-primary/20 hover:bg-card/80 cursor-pointer">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Weekly Activity</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Views and engagement over time</p>
      </div>
      
      <div className="h-48 sm:h-56 lg:h-64">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--growth-primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--growth-primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--growth-secondary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--growth-secondary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day_name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
                labelFormatter={(label) => `Day: ${label}`}
                formatter={(value, name) => [
                  value,
                  name === 'followers' ? 'Views' : 'Engagement'
                ]}
              />
              <Area
                type="monotone"
                dataKey="followers"
                stroke="hsl(var(--growth-primary))"
                fillOpacity={1}
                fill="url(#colorFollowers)"
                strokeWidth={2}
                name="Views"
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="hsl(var(--growth-secondary))"
                fillOpacity={1}
                fill="url(#colorEngagement)"
                strokeWidth={2}
                name="Engagement"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}