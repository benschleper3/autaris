import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileBarChart, Briefcase, Download, Trash2, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  campaign_name: string;
}

interface ReportLink {
  id: string;
  created_at: string;
  campaign_name: string;
  from_date: string;
  to_date: string;
  url: string;
}

interface PortfolioItem {
  id: string;
  post_id: string;
  title: string;
  platform: string;
  engagement_rate: number;
  views: number;
}

export default function Reports() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [reportLinks, setReportLinks] = useState<ReportLink[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('id, title as campaign_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setCampaigns(campaignsData || []);

      // Fetch report links
      const { data: reportsData } = await supabase
        .from('report_links')
        .select('id, created_at, title as campaign_name, url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setReportLinks(reportsData?.map(item => ({
        ...item,
        from_date: '',
        to_date: ''
      })) || []);

      // Fetch portfolio items
      const { data: portfolioData } = await supabase
        .from('portfolio_items')
        .select(`
          id, post_id,
          title, description
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Get post details for portfolio items
      if (portfolioData && portfolioData.length > 0) {
        const postIds = portfolioData.map(item => item.post_id).filter(Boolean);
        
        if (postIds.length > 0) {
          const { data: postsData } = await supabase
            .from('v_posts_with_latest')
            .select('post_id, title, platform, engagement_rate, views')
            .eq('user_id', user.id)
            .in('post_id', postIds);

          const enrichedPortfolio = portfolioData.map(item => {
            const postData = postsData?.find(post => post.post_id === item.post_id);
            return {
              ...item,
              title: postData?.title || item.title || 'Untitled',
              platform: postData?.platform || 'Unknown',
              engagement_rate: postData?.engagement_rate || 0,
              views: postData?.views || 0
            };
          });

          setPortfolioItems(enrichedPortfolio);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const generateReport = async () => {
    if (!fromDate || !toDate) {
      toast({
        title: "Missing Information",
        description: "Please select both from and to dates",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      // Mock report generation
      const reportUrl = `https://example.com/reports/${Date.now()}.pdf`;
      
      // Save report link
      const { error } = await supabase
        .from('report_links')
        .insert({
          user_id: user.id,
          title: `Brand Report - ${new Date(fromDate).toLocaleDateString()}`,
          url: reportUrl,
          report_type: 'brand_report'
        });

      if (error) throw error;

      toast({
        title: "Report Generated",
        description: "Your brand report has been created successfully",
      });

      fetchData(); // Refresh the reports list
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const removeFromPortfolio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Removed",
        description: "Item removed from portfolio",
      });

      fetchData(); // Refresh the portfolio
    } catch (error) {
      console.error('Error removing from portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'tiktok': return 'bg-pink-500/10 text-pink-700 dark:text-pink-300';
      case 'instagram': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'youtube': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Reports & Portfolio
          </h1>
          <p className="text-muted-foreground mt-1">Generate brand reports and manage your portfolio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generate Brand Report */}
          <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="w-5 h-5" />
                Generate Brand Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign (Optional)</label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All campaigns</SelectItem>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.campaign_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From Date</label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">To Date</label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={generateReport} 
                disabled={generating}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>

          {/* Portfolio Quick List */}
          <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Portfolio ({portfolioItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {portfolioItems.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No portfolio items</p>
                  <p className="text-sm text-muted-foreground">Add posts from your content library</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={getPlatformColor(item.platform)}>
                            {item.platform}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.views.toLocaleString()} views • {item.engagement_rate.toFixed(1)}% ER
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromPortfolio(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report History */}
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Report History</CardTitle>
          </CardHeader>
          <CardContent>
            {reportLinks.length === 0 ? (
              <div className="text-center py-8">
                <FileBarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No reports generated</p>
                <p className="text-sm text-muted-foreground">Generate your first brand report above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportLinks.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {report.campaign_name}
                        </TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={report.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}