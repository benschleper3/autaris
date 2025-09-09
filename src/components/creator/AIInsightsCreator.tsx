import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles } from 'lucide-react';

interface Insight {
  week_start: string;
  narrative: string;
  confidence: number;
}

export default function AIInsightsCreator() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data, error } = await supabase
          .from('weekly_insights')
          .select('week_start, narrative')
          .order('week_start', { ascending: false })
          .limit(5);

        if (error) throw error;
        
        // Add mock confidence for now
        const insightsWithConfidence = (data || []).map(insight => ({
          ...insight,
          confidence: Math.floor(Math.random() * 20) + 80 // 80-100%
        }));
        
        setInsights(insightsWithConfidence);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No insights available yet</p>
              <p className="text-sm">Insights will appear as you create more content</p>
            </div>
          ) : (
            insights.map((insight, index) => (
              <div key={index} className="p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Week of {new Date(insight.week_start).toLocaleDateString()}
                  </span>
                  <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full">
                    {insight.confidence}% confidence
                  </span>
                </div>
                <p className="text-sm">{insight.narrative}</p>
              </div>
            ))
          )}
          
          <Button className="w-full" variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate New Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}