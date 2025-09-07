import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FolderOpen, Plus, BarChart3, Calendar, Target } from 'lucide-react';
import { toast } from '../ui/use-toast';

export default function CampaignDashboard() {
  const handleCreateCampaign = () => {
    toast({
      title: "Create New Campaign",
      description: "Campaign creation form would open here",
    });
  };

  const campaigns = [
    {
      name: 'Beauty Co. Winter Launch',
      posts: 8,
      totalViews: '2.1M',
      totalEngagement: '156K',
      avgEngagementRate: '7.4%',
      status: 'active',
      deadline: 'Jan 30'
    },
    {
      name: 'Fashion Brand Collab',
      posts: 12,
      totalViews: '1.8M',
      totalEngagement: '134K',
      avgEngagementRate: '7.4%',
      status: 'completed',
      deadline: 'Jan 15'
    },
    {
      name: 'Tech Product Review',
      posts: 3,
      totalViews: '456K',
      totalEngagement: '34K',
      avgEngagementRate: '7.5%',
      status: 'draft',
      deadline: 'Feb 5'
    }
  ];

  return (
    <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Campaign Dashboard</h3>
        <FolderOpen className="w-5 h-5 text-growth-accent" />
      </div>

      <div className="space-y-4">
        {/* Create Campaign Button */}
        <Button onClick={handleCreateCampaign} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create New Campaign
        </Button>

        {/* Active Campaigns */}
        <div className="space-y-3">
          {campaigns.map((campaign, index) => (
            <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm">{campaign.name}</div>
                <Badge 
                  variant={
                    campaign.status === 'active' ? 'default' :
                    campaign.status === 'completed' ? 'secondary' : 'outline'
                  }
                  className="text-xs"
                >
                  {campaign.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="w-3 h-3" />
                  {campaign.posts} posts
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Due {campaign.deadline}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded bg-background/50">
                  <div className="text-sm font-medium">{campaign.totalViews}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                <div className="text-center p-2 rounded bg-background/50">
                  <div className="text-sm font-medium">{campaign.totalEngagement}</div>
                  <div className="text-xs text-muted-foreground">Engagement</div>
                </div>
                <div className="text-center p-2 rounded bg-background/50">
                  <div className="text-sm font-medium">{campaign.avgEngagementRate}</div>
                  <div className="text-xs text-muted-foreground">Avg ER</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="p-2 rounded-lg bg-growth-accent/5 border border-growth-accent/20">
          <div className="text-xs text-center text-muted-foreground">
            📊 Track performance across all your brand partnerships
          </div>
        </div>
      </div>
    </Card>
  );
}