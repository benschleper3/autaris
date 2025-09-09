import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';

interface RevenueData {
  month: string;
  amount_usd: number;
}

interface PayoutData {
  brand_name: string;
  amount_usd: number;
  paid_at: string;
  notes: string;
}

export default function RevenueTracker() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueData[]>([]);
  const [latestPayouts, setLatestPayouts] = useState<PayoutData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        // Fetch monthly revenue data
        const { data: revenueData, error: revenueError } = await supabase
          .from('creator_revenue')
          .select('paid_at, amount_cents')
          .order('paid_at', { ascending: true });

        if (revenueError) throw revenueError;

        // Group by month
        const monthlyData = (revenueData || []).reduce((acc, item) => {
          const month = new Date(item.paid_at).toISOString().slice(0, 7); // YYYY-MM format
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month] += item.amount_cents / 100;
          return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(monthlyData).map(([month, amount]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount_usd: amount
        }));

        setMonthlyRevenue(chartData);

        // Fetch latest payouts
        const { data: payoutData, error: payoutError } = await supabase
          .from('creator_revenue')
          .select('brand_name, amount_cents, paid_at, notes')
          .order('paid_at', { ascending: false })
          .limit(5);

        if (payoutError) throw payoutError;

        const formattedPayouts = (payoutData || []).map(item => ({
          ...item,
          amount_usd: item.amount_cents / 100
        }));

        setLatestPayouts(formattedPayouts);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-48 bg-muted/50 rounded animate-pulse" />
            <div className="h-32 bg-muted/50 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Revenue Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Chart */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Monthly Revenue
          </h4>
          {monthlyRevenue.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount_usd" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No revenue data available
            </div>
          )}
        </div>

        {/* Latest Payouts Table */}
        <div>
          <h4 className="font-medium mb-3">Latest Payouts</h4>
          {latestPayouts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestPayouts.map((payout, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{payout.brand_name || 'Unknown'}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ${payout.amount_usd.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(payout.paid_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {payout.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-6">
              No payout history available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}