import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, Eye, Heart, Share, MessageCircle, Bookmark } from 'lucide-react';

export default function ContentPerformanceTracker() {
  // Mock data for UGC content performance
  const platforms = [
    {
      name: 'TikTok',
      color: 'bg-pink-500',
      metrics: {
        views: '1.2M',
        likes: '85.4K',
        shares: '12.3K',
        comments: '5.8K',
        saves: '22.1K',
        engagementRate: '8.9%'
      }
    },
    {
      name: 'Instagram',
      color: 'bg-purple-500',
      metrics: {
        views: '456K',
        likes: '34.2K',
        shares: '4.1K',
        comments: '2.8K',
        saves: '8.9K',
        engagementRate: '7.5%'
      }
    },
    {
      name: 'YouTube',
      color: 'bg-red-500',
      metrics: {
        views: '89.3K',
        likes: '6.7K',
        shares: '890',
        comments: '1.2K',
        saves: '2.3K',
        engagementRate: '12.1%'
      }
    }
  ];

  const MetricItem = ({ icon: Icon, label, value, trend }: any) => (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-medium">{value}</span>
        {trend && (
          <TrendingUp className="w-3 h-3 text-growth-success" />
        )}
      </div>
    </div>
  );

  return (
    <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Content Performance</h3>
        <Badge variant="secondary" className="text-xs">
          Last 30 days
        </Badge>
      </div>

      <div className="space-y-4">
        {platforms.map((platform) => (
          <div key={platform.name} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${platform.color}`} />
              <span className="font-medium text-sm">{platform.name}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <MetricItem
                icon={Eye}
                label="Views"
                value={platform.metrics.views}
                trend={true}
              />
              <MetricItem
                icon={Heart}
                label="Likes"
                value={platform.metrics.likes}
                trend={true}
              />
              <MetricItem
                icon={Share}
                label="Shares"
                value={platform.metrics.shares}
                trend={false}
              />
              <MetricItem
                icon={MessageCircle}
                label="Comments"
                value={platform.metrics.comments}
                trend={true}
              />
              <MetricItem
                icon={Bookmark}
                label="Saves"
                value={platform.metrics.saves}
                trend={true}
              />
              <div className="col-span-2">
                <MetricItem
                  icon={TrendingUp}
                  label="Engagement Rate"
                  value={platform.metrics.engagementRate}
                  trend={true}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}