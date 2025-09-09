import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InsightData {
  week_start: string;
  insight: string;
  confidence: number;
}

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: insightsData, error } = await supabase
          .from('weekly_insights')
          .select('week_start, narrative, recommendations')
          .eq('user_id', user.id)
          .order('week_start', { ascending: false })
          .limit(5);

        if (error) throw error;
        
        const formattedInsights = (insightsData || []).map(insight => ({
          week_start: insight.week_start,
          insight: insight.narrative || insight.recommendations || 'No insights available',
          confidence: 90 // Mock confidence score
        }));
        
        setInsights(formattedInsights);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const generateNewInsights = async () => {
    setGenerating(true);
    try {
      // TODO: Implement API call to /api/ai/creator-insights
      console.log('Generating new insights...');
      
      // Mock delay and refresh
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refresh insights after generation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newInsightsData, error } = await supabase
        .from('weekly_insights')
        .select('week_start, narrative, recommendations')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(5);

      if (!error) {
        const formattedInsights = (newInsightsData || []).map(insight => ({
          week_start: insight.week_start,
          insight: insight.narrative || insight.recommendations || 'No insights available',
          confidence: 90
        }));
        
        setInsights(formattedInsights);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-chart-4 text-white';
    if (confidence >= 60) return 'bg-chart-3 text-white';
    return 'bg-chart-5 text-white';
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-chart-3" />
            AI Insights (Weekly)
          </CardTitle>
          <Button
            onClick={generateNewInsights}
            disabled={generating}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Generate New'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No insights available yet.</p>
            <p className="text-sm">Click "Generate New" to create your first insights.</p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-gradient-to-r from-card/50 to-muted/30 border border-border/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-chart-3" />
                  <span className="text-sm font-medium">
                    Week of {new Date(insight.week_start).toLocaleDateString()}
                  </span>
                </div>
                <Badge className={getConfidenceColor(insight.confidence)}>
                  {insight.confidence}% confidence
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight.insight}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}