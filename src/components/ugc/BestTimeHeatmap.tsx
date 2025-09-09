import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface HeatmapData {
  platform: string;
  dow: number;
  hour: number;
  avg_engagement_percent: number;
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export default function BestTimeHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const { data, error } = await supabase
          .from('v_time_heatmap')
          .select('platform, dow, hour, avg_engagement_percent');

        if (error) throw error;
        setHeatmapData(data || []);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 8) return 'bg-green-500';
    if (engagement >= 6) return 'bg-yellow-500';
    if (engagement >= 4) return 'bg-orange-500';
    if (engagement > 0) return 'bg-red-500';
    return 'bg-muted';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Best Time to Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted/50 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Best Time to Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Day labels */}
          <div className="flex gap-1">
            <div className="w-8" />
            {days.map((day) => (
              <div key={day} className="w-6 text-xs text-center text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {hours.map((hour) => (
              <div key={hour} className="flex items-center gap-1">
                <div className="w-8 text-xs text-muted-foreground text-right">
                  {hour}h
                </div>
                {days.map((_, dayIndex) => {
                  const dataPoint = heatmapData.find(
                    (d) => d.dow === dayIndex && d.hour === hour
                  );
                  const engagement = dataPoint?.avg_engagement_percent || 0;
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`w-6 h-4 rounded-sm ${getEngagementColor(engagement)}`}
                      title={`${days[dayIndex]} ${hour}:00 - ${engagement.toFixed(1)}% engagement`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Low</span>
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <div className="w-3 h-3 rounded-sm bg-orange-500" />
            <div className="w-3 h-3 rounded-sm bg-yellow-500" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span>High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}