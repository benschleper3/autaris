import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Clock, Lightbulb, TestTube, Target } from "lucide-react";
import GenerateInsightsButton from "@/components/GenerateInsightsButton";

type Insight = {
  week_start: string;
  summary: string;
  key_metrics: {
    views_7d: number;
    views_30d: number;
    avg_er_7d: number;
    avg_er_30d: number;
    posts_7d: number;
    posts_30d: number;
  };
  best_times: Array<{ platform: string; dow: number; hour: number; reason: string }>;
  patterns: string[];
  experiments: string[];
  recommendations: string[];
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function InsightsPanel() {
  const [items, setItems] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("weekly_insights")
      .select("week_start, summary, key_metrics, best_times, patterns, experiments, recommendations")
      .eq("user_id", uid)
      .order("week_start", { ascending: false })
      .limit(5);

    if (!error && data) {
      setItems(data as any);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Insights
            </CardTitle>
            <GenerateInsightsButton onSuccess={fetchInsights} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Insights
            </CardTitle>
            <GenerateInsightsButton onSuccess={fetchInsights} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No insights yet. Click "Generate AI Insights" to create your first analysis.
          </div>
        </CardContent>
      </Card>
    );
  }

  const latest = items[0];
  const km = latest.key_metrics as any || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Insights
            <Badge variant="secondary" className="ml-2">
              Week of {new Date(latest.week_start).toLocaleDateString()}
            </Badge>
          </CardTitle>
          <GenerateInsightsButton onSuccess={fetchInsights} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm leading-relaxed">{latest.summary}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-lg border p-4 bg-card hover:bg-muted/50 transition-colors">
            <div className="text-xs text-muted-foreground mb-1">Views (7d)</div>
            <div className="text-2xl font-bold">{km.views_7d?.toLocaleString() ?? 0}</div>
          </div>
          <div className="rounded-lg border p-4 bg-card hover:bg-muted/50 transition-colors">
            <div className="text-xs text-muted-foreground mb-1">Views (30d)</div>
            <div className="text-2xl font-bold">{km.views_30d?.toLocaleString() ?? 0}</div>
          </div>
          <div className="rounded-lg border p-4 bg-card hover:bg-muted/50 transition-colors">
            <div className="text-xs text-muted-foreground mb-1">Avg ER% (7d)</div>
            <div className="text-2xl font-bold">{km.avg_er_7d?.toFixed(2) ?? 0}%</div>
          </div>
          <div className="rounded-lg border p-4 bg-card hover:bg-muted/50 transition-colors">
            <div className="text-xs text-muted-foreground mb-1">Avg ER% (30d)</div>
            <div className="text-2xl font-bold">{km.avg_er_30d?.toFixed(2) ?? 0}%</div>
          </div>
          <div className="rounded-lg border p-4 bg-card hover:bg-muted/50 transition-colors">
            <div className="text-xs text-muted-foreground mb-1">Posts (7d)</div>
            <div className="text-2xl font-bold">{km.posts_7d ?? 0}</div>
          </div>
          <div className="rounded-lg border p-4 bg-card hover:bg-muted/50 transition-colors">
            <div className="text-xs text-muted-foreground mb-1">Posts (30d)</div>
            <div className="text-2xl font-bold">{km.posts_30d ?? 0}</div>
          </div>
        </div>

        {!!(latest.best_times||[]).length && (
          <div>
            <div className="flex items-center gap-2 font-semibold mb-3">
              <Clock className="w-4 h-4 text-primary" />
              Best Times to Post
            </div>
            <div className="space-y-2">
              {(latest.best_times||[]).slice(0,5).map((t,i)=>(
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <Badge className="bg-primary/10 text-primary">
                    {t.platform || 'TikTok'}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {dayNames[t.dow]} at {t.hour}:00
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{t.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!!(latest.patterns||[]).length && (
          <div>
            <div className="flex items-center gap-2 font-semibold mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              Patterns Detected
            </div>
            <ul className="space-y-2">
              {latest.patterns.map((p,i)=>(
                <li key={i} className="flex gap-2 text-sm p-3 rounded-lg border bg-card">
                  <span className="text-primary">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!!(latest.experiments||[]).length && (
          <div>
            <div className="flex items-center gap-2 font-semibold mb-3">
              <TestTube className="w-4 h-4 text-primary" />
              Suggested Experiments
            </div>
            <ul className="space-y-2">
              {latest.experiments.map((p,i)=>(
                <li key={i} className="flex gap-2 text-sm p-3 rounded-lg border bg-card">
                  <span className="text-primary">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!!(latest.recommendations||[]).length && (
          <div>
            <div className="flex items-center gap-2 font-semibold mb-3">
              <Target className="w-4 h-4 text-primary" />
              Recommendations
            </div>
            <ul className="space-y-2">
              {latest.recommendations.map((p,i)=>(
                <li key={i} className="flex gap-2 text-sm p-3 rounded-lg border bg-card">
                  <span className="text-primary">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
    </svg>
  );
}