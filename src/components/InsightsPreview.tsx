import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, TrendingUp, Calendar } from 'lucide-react';

export default function InsightsPreview() {
  return (
    <Card className="p-3 sm:p-4 lg:p-6 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-growth-primary/20 hover:bg-card/80 cursor-pointer">
      <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-lg font-semibold text-foreground">Weekly AI Insights</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Generated 2 hours ago</p>
          </div>
        </div>
        <Badge className="bg-growth-success/10 text-growth-success border-growth-success/20 text-xs flex-shrink-0">
          New Report
        </Badge>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-growth-primary/10 to-growth-secondary/10 border border-growth-primary/20">
          <h4 className="font-medium text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">📈 Key Insight</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Your LinkedIn posts about "coaching frameworks" generate 3x more engagement than general business advice. 
            Consider creating more structured, actionable content.
          </p>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-growth-secondary flex-shrink-0" />
            <span className="text-muted-foreground">Best posting time:</span>
            <span className="text-foreground font-medium">Tuesday 9:00 AM</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-growth-success flex-shrink-0" />
            <span className="text-muted-foreground">Growth opportunity:</span>
            <span className="text-foreground font-medium">Video content (+45% engagement)</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-growth-accent flex-shrink-0" />
            <span className="text-muted-foreground">Recommended frequency:</span>
            <span className="text-foreground font-medium">5 posts/week</span>
          </div>
        </div>

        <div className="pt-3 sm:pt-4 border-t border-border/30">
          <Button className="w-full bg-growth-primary hover:bg-growth-primary-light text-sm">
            View Full Report
          </Button>
        </div>
      </div>
    </Card>
  );
}