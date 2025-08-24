import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, TrendingUp, Calendar } from 'lucide-react';

export default function InsightsPreview() {
  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-growth-primary/20 hover:bg-card/80 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Weekly AI Insights</h3>
            <p className="text-sm text-muted-foreground">Generated 2 hours ago</p>
          </div>
        </div>
        <Badge className="bg-growth-success/10 text-growth-success border-growth-success/20">
          New Report
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-gradient-to-r from-growth-primary/10 to-growth-secondary/10 border border-growth-primary/20">
          <h4 className="font-medium text-foreground mb-2">📈 Key Insight</h4>
          <p className="text-sm text-muted-foreground">
            Your LinkedIn posts about "coaching frameworks" generate 3x more engagement than general business advice. 
            Consider creating more structured, actionable content.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-growth-secondary" />
            <span className="text-muted-foreground">Best posting time:</span>
            <span className="text-foreground font-medium">Tuesday 9:00 AM</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <TrendingUp className="w-4 h-4 text-growth-success" />
            <span className="text-muted-foreground">Growth opportunity:</span>
            <span className="text-foreground font-medium">Video content (+45% engagement)</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-growth-accent" />
            <span className="text-muted-foreground">Recommended frequency:</span>
            <span className="text-foreground font-medium">5 posts/week</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30">
          <Button className="w-full bg-growth-primary hover:bg-growth-primary-light">
            View Full Report
          </Button>
        </div>
      </div>
    </Card>
  );
}