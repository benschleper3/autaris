import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Mon', followers: 2400, engagement: 1400 },
  { name: 'Tue', followers: 2210, engagement: 1600 },
  { name: 'Wed', followers: 2290, engagement: 1800 },
  { name: 'Thu', followers: 2000, engagement: 2200 },
  { name: 'Fri', followers: 2181, engagement: 2400 },
  { name: 'Sat', followers: 2500, engagement: 2100 },
  { name: 'Sun', followers: 2100, engagement: 2300 },
];

export default function ActivityChart() {
  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Weekly Activity</h3>
        <p className="text-sm text-muted-foreground">Followers and engagement over time</p>
      </div>
      
      <div className="h-64">
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
              dataKey="name" 
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
            />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="hsl(var(--growth-primary))"
              fillOpacity={1}
              fill="url(#colorFollowers)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="hsl(var(--growth-secondary))"
              fillOpacity={1}
              fill="url(#colorEngagement)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}