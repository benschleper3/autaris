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
    <Card className={cn("p-3 sm:p-4 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-growth-primary/20 hover:bg-card/80 cursor-pointer", className)}>
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-2">
        <h3 className="text-lg sm:text-2xl font-bold text-foreground">{value}</h3>
        <div className={cn(
          "flex items-center gap-1 text-xs sm:text-sm font-medium",
          changeType === 'positive' ? "text-growth-success" : "text-growth-danger"
        )}>
          <TrendIcon className="w-3 h-3" />
          {change}
        </div>
      </div>
    </Card>
  );
}