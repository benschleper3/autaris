import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Clock, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HeatmapData {
  platform: string;
  dow: number;
  hour: number;
  avg_engagement_percent: number;
}

export default function BestTimeAnalytics() {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const { data: heatmapData, error } = await supabase
          .from('v_time_heatmap')
          .select('platform, dow, hour, avg_engagement_percent')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (error) throw error;
        setData(heatmapData || []);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  const filteredData = selectedPlatform === 'all' 
    ? data 
    : data.filter(d => d.platform === selectedPlatform);

  const platforms = ['all', ...Array.from(new Set(data.map(d => d.platform)))];

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 8) return 'bg-chart-1';
    if (engagement >= 6) return 'bg-chart-2';
    if (engagement >= 4) return 'bg-chart-3';
    if (engagement >= 2) return 'bg-chart-4';
    return 'bg-muted/30';
  };

  const getCellEngagement = (day: number, hour: number) => {
    const cellData = filteredData.find(d => d.dow === day && d.hour === hour);
    return cellData?.avg_engagement_percent || 0;
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-chart-1" />
          Best Time to Post
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          {platforms.map((platform) => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlatform(platform)}
              className="capitalize"
            >
              {platform}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="grid grid-cols-25 gap-1 text-xs mb-2">
              <div></div>
              {hours.map(hour => (
                <div key={hour} className="text-center text-muted-foreground text-[10px]">
                  {hour}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            {days.map((day, dayIndex) => (
              <div key={day} className="grid grid-cols-25 gap-1 mb-1">
                <div className="text-muted-foreground font-medium py-1 text-xs w-8">
                  {day}
                </div>
                {hours.map(hour => {
                  const engagement = getCellEngagement(dayIndex, hour);
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`h-4 w-4 rounded ${getEngagementColor(engagement)} transition-all hover:scale-110 cursor-pointer`}
                      title={`${day} ${hour}:00 - ${engagement.toFixed(1)}% engagement`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Low</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-3 h-3 rounded ${getEngagementColor(i * 2)}`} />
            ))}
          </div>
          <span>High</span>
        </div>
      </CardContent>
    </Card>
  );
}