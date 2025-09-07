import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Brain, Clock, Lightbulb, Target, TrendingUp } from 'lucide-react';

export default function AIGrowthInsights() {
  const insights = [
    {
      type: 'Best Time',
      icon: Clock,
      title: 'Optimal Posting Time',
      description: 'Your audience is most active at 7-9 PM EST',
      confidence: 94,
      color: 'text-blue-500'
    },
    {
      type: 'Hook Style',
      icon: Target,
      title: 'Top Performing Hook',
      description: 'Question-based hooks get 40% more engagement',
      confidence: 87,
      color: 'text-purple-500'
    },
    {
      type: 'Content Angle',
      icon: Lightbulb,
      title: 'Trending Content Type',
      description: 'Behind-the-scenes content performs 25% better',
      confidence: 91,
      color: 'text-green-500'
    },
    {
      type: 'Growth Tip',
      icon: TrendingUp,
      title: 'Engagement Booster',
      description: 'Add polls to stories - increases saves by 30%',
      confidence: 89,
      color: 'text-orange-500'
    }
  ];

  return (
    <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">AI Growth Insights</h3>
        <Brain className="w-5 h-5 text-growth-primary" />
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-background/50 ${insight.color}`}>
                <insight.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{insight.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {insight.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Badge */}
      <div className="mt-4 p-2 rounded-lg bg-gradient-to-r from-growth-primary/5 to-growth-secondary/5 border border-growth-primary/20">
        <div className="text-xs text-center text-muted-foreground">
          ✨ Insights powered by AI analysis of your content performance
        </div>
      </div>
    </Card>
  );
}