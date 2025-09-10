import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Filters {
  from: Date | null;
  to: Date | null;
  platform: string | null;
}

interface InsightData {
  week_start: string;
  insight: string;
  confidence: number;
}

interface Props {
  filters: Filters;
}

export default function UGCInsights({ filters }: Props) {
  const [data, setData] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: insightsData, error } = await supabase
        .from('weekly_insights')
        .select('week_start, narrative, recommendations')
        .eq('user_id', user.user.id)
        .order('week_start', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching insights:', error);
        setData([]);
      } else {
        const formatted = (insightsData || []).map(item => ({
          week_start: item.week_start,
          insight: item.narrative || item.recommendations || 'No insights available',
          confidence: 85 // Mock confidence score
        }));
        setData(formatted);
      }
    } catch (error) {
      console.error('Error:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setGenerating(true);
    try {
      // This would call an AI API to generate insights
      toast({
        title: "Generating Insights",
        description: "AI insights generation coming soon",
      });
      
      // TODO: Implement actual AI insights generation
      // const response = await fetch('/api/ai/ugc-insights', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     from: filters.from?.toISOString(),
      //     to: filters.to?.toISOString(),
      //     platform: filters.platform
      //   })
      // });
      
      // if (response.ok) {
      //   await fetchInsights();
      //   toast({
      //     title: "Success",
      //     description: "New insights have been generated",
      //   });
      // }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate insights",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  return (
    <Card id="ai-insights" className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Insights
          </CardTitle>
          <Button 
            onClick={generateInsights} 
            disabled={generating}
            size="sm" 
            variant="outline"
          >
            {generating ? "Generating..." : "Generate Insights"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No insights yet</p>
            <p className="text-sm text-muted-foreground">Generate AI insights to improve your content</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.slice(0, 3).map((insight, index) => (
              <div key={index} className="p-3 bg-background/50 rounded-lg border">
                <p className="text-sm">{insight.insight}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    Week of {new Date(insight.week_start).toLocaleDateString()}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Confidence: {insight.confidence}%
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