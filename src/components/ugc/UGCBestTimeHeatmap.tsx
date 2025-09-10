import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

interface Filters {
  from: Date | null;
  to: Date | null;
  platform: string | null;
}

interface HeatmapData {
  platform: string;
  dow: number;
  hour: number;
  avg_engagement_percent: number;
}

interface Props {
  filters: Filters;
}

export default function UGCBestTimeHeatmap({ filters }: Props) {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        let query = supabase
          .from('v_time_heatmap')
          .select('platform, dow, hour, avg_engagement_percent')
          .eq('user_id', user.user.id);

        if (filters.platform) {
          query = query.eq('platform', filters.platform as any);
        }

        const { data: heatmapData, error } = await query;

        if (error) {
          console.error('Error fetching heatmap data:', error);
          setData([]);
        } else {
          setData(heatmapData || []);
        }
      } catch (error) {
        console.error('Error:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [filters]);

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 8) return 'bg-green-500';
    if (engagement >= 6) return 'bg-green-400';
    if (engagement >= 4) return 'bg-yellow-400';
    if (engagement >= 2) return 'bg-orange-400';
    if (engagement > 0) return 'bg-red-400';
    return 'bg-gray-200 dark:bg-gray-800';
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  return (
    <Card id="heatmap-posting" className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Best Time to Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No timing data yet</p>
            <p className="text-sm text-muted-foreground">Post content to see optimal timing</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Heatmap Grid */}
            <div className="grid grid-cols-25 gap-1 text-xs">
              {/* Hour headers */}
              <div></div>
              {hours.map(hour => (
                <div key={hour} className="text-center text-muted-foreground py-1">
                  {hour}
                </div>
              ))}

              {/* Days and heatmap cells */}
              {days.map((day, dayIndex) => (
                <div key={day} className="contents">
                  <div className="text-right pr-2 py-1 text-muted-foreground font-medium">
                    {day}
                  </div>
                  {hours.map(hour => {
                    const dataPoint = data.find(d => d.dow === dayIndex && d.hour === hour);
                    const engagement = dataPoint?.avg_engagement_percent || 0;
                    
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className={`w-4 h-4 rounded-sm ${getEngagementColor(engagement)}`}
                        title={`${day} ${hour}:00 - ${engagement.toFixed(1)}% avg engagement`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Low</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              </div>
              <span>High</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}