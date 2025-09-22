import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Eye, TrendingUp, CheckCircle } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  brand_name: string;
  total_views: number;
  avg_engagement_rate: number;
  deliverables_count: number;
  approved_count: number;
}

export default function ActiveCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform campaigns data to match Campaign interface
        const transformedCampaigns: Campaign[] = (data || []).map(campaign => ({
          id: campaign.id,
          title: campaign.title,
          brand_name: campaign.brand_name || 'Unknown Brand',
          total_views: Math.floor(Math.random() * 100000) + 10000, // Mock data
          avg_engagement_rate: Math.random() * 5 + 1, // Mock data
          deliverables_count: Math.floor(Math.random() * 10) + 1, // Mock data
          approved_count: Math.floor(Math.random() * 5) + 1 // Mock data
        }));

        setCampaigns(transformedCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
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
          <Briefcase className="w-5 h-5" />
          Active Campaigns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active campaigns</p>
              <p className="text-sm">Start by creating your first campaign</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{campaign.title}</h4>
                    <p className="text-muted-foreground">{campaign.brand_name}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="font-medium">{campaign.total_views.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-muted-foreground">Avg ER</p>
                      <p className="font-medium">{campaign.avg_engagement_rate}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-muted-foreground">Deliverables</p>
                      <p className="font-medium">{campaign.deliverables_count}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-muted-foreground">Approved</p>
                      <p className="font-medium">{campaign.approved_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}