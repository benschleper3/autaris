import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon?: React.ReactNode;
  className?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  className 
}: MetricCardProps) {
  const TrendIcon = changeType === 'positive' ? TrendingUp : TrendingDown;
  
  return (
    <Card className={cn("p-6 border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-2">
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          changeType === 'positive' ? "text-growth-success" : "text-growth-danger"
        )}>
          <TrendIcon className="w-3 h-3" />
          {change}
        </div>
      </div>
    </Card>
  );
}