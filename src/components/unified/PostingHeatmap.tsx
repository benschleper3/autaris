import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface PostingHeatmapProps {
  filters: {
    from: Date | null;
    to: Date | null;
    platform: string;
  };
}

interface HeatmapData {
  platform: string;
  dow: number;
  hour: number;
  avg_engagement_percent: number;
}

export default function PostingHeatmap({ filters }: PostingHeatmapProps) {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmapData();
  }, [filters]);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('v_time_heatmap')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      // Apply platform filter
      if (filters.platform !== 'all') {
        query = query.eq('platform', filters.platform as any);
      }

      const { data: heatmapData, error } = await query;

      if (error) throw error;
      setData(heatmapData || []);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 8) return 'bg-green-500';
    if (engagement >= 6) return 'bg-green-400';
    if (engagement >= 4) return 'bg-yellow-400';
    if (engagement >= 2) return 'bg-orange-400';
    if (engagement > 0) return 'bg-red-400';
    return 'bg-gray-200';
  };

  const getCellEngagement = (day: number, hour: number) => {
    const cell = data.find(d => d.dow === day && d.hour === hour);
    return cell?.avg_engagement_percent || 0;
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Best Time to Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="heatmap-posting">
      <CardHeader>
        <CardTitle>Best Time to Post</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-2">
              <div className="w-12"></div>
              {hours.map(hour => (
                <div key={hour} className="flex-1 text-xs text-center text-muted-foreground">
                  {hour}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            {days.map((day, dayIndex) => (
              <div key={day} className="flex items-center mb-1">
                <div className="w-12 text-xs font-medium text-muted-foreground">
                  {day}
                </div>
                {hours.map(hour => {
                  const engagement = getCellEngagement(dayIndex, hour);
                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={`flex-1 h-6 m-0.5 rounded-sm ${getEngagementColor(engagement)} hover:opacity-80 transition-opacity cursor-pointer`}
                      title={`${day} ${hour}:00 - ${engagement.toFixed(1)}% avg engagement`}
                    />
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-200 rounded-sm" />
                <div className="w-3 h-3 bg-red-400 rounded-sm" />
                <div className="w-3 h-3 bg-orange-400 rounded-sm" />
                <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
                <div className="w-3 h-3 bg-green-400 rounded-sm" />
                <div className="w-3 h-3 bg-green-500 rounded-sm" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}