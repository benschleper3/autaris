import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIInsightsListProps {
  filters: {
    from: Date | null;
    to: Date | null;
    platform: string;
  };
}

interface InsightData {
  week_start: string;
  narrative: string;
  recommendations: string;
}

export default function AIInsightsList({ filters }: AIInsightsListProps) {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('weekly_insights')
        .select('week_start, narrative, recommendations')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('week_start', { ascending: false })
        .limit(5);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      setGenerating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await fetch('https://your-n8n-domain.com/webhook/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: filters.from?.toISOString().split('T')[0] || null,
          to: filters.to?.toISOString().split('T')[0] || null,
          platform: filters.platform,
          user_id: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to generate insights');

      toast({
        title: "Insights Generated",
        description: "New AI insights have been generated based on your content performance."
      });

      // Refresh insights list
      await fetchInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="ai-insights">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Insights
          </CardTitle>
          <Button 
            onClick={generateInsights} 
            disabled={generating}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No insights yet</p>
            <Button onClick={generateInsights} disabled={generating}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Your First Insights
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Week of {new Date(insight.week_start).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{insight.narrative}</p>
                  <div className="text-sm text-muted-foreground">
                    <p className="whitespace-pre-line">{insight.recommendations}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}