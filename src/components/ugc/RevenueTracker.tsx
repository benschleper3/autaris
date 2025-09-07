import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DollarSign, Plus, TrendingUp, Calendar } from 'lucide-react';
import { toast } from '../ui/use-toast';

export default function RevenueTracker() {
  const handleAddRevenue = () => {
    toast({
      title: "Add New Revenue",
      description: "Revenue entry form would open here",
    });
  };

  const revenueData = [
    { brand: 'Beauty Co.', amount: '$2,500', date: 'Jan 15', status: 'paid', type: 'Sponsored Post' },
    { brand: 'Fashion Brand', amount: '$1,800', date: 'Jan 10', status: 'pending', type: 'Story Series' },
    { brand: 'Tech Startup', amount: '$3,200', date: 'Dec 28', status: 'paid', type: 'Video Review' },
    { brand: 'Lifestyle Co.', amount: '$950', date: 'Dec 20', status: 'paid', type: 'Reel Package' }
  ];

  const totalRevenue = '$8,450';
  const monthlyGrowth = '+18.5%';

  return (
    <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Revenue Tracker</h3>
        <DollarSign className="w-5 h-5 text-growth-success" />
      </div>

      <div className="space-y-4">
        {/* Revenue Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-growth-success/5 border border-growth-success/20">
            <div className="text-lg font-bold text-growth-success">{totalRevenue}</div>
            <div className="text-xs text-muted-foreground">Total This Month</div>
          </div>
          <div className="p-3 rounded-lg bg-growth-primary/5 border border-growth-primary/20">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-growth-primary">{monthlyGrowth}</span>
              <TrendingUp className="w-4 h-4 text-growth-primary" />
            </div>
            <div className="text-xs text-muted-foreground">Growth Rate</div>
          </div>
        </div>

        {/* Add Revenue Button */}
        <Button onClick={handleAddRevenue} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add New Revenue
        </Button>

        {/* Recent Revenue */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Earnings</h4>
          {revenueData.map((revenue, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <div className="flex-1">
                <div className="font-medium text-sm">{revenue.brand}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {revenue.date} • {revenue.type}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={revenue.status === 'paid' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {revenue.status}
                </Badge>
                <span className="font-bold text-sm text-growth-success">
                  {revenue.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}