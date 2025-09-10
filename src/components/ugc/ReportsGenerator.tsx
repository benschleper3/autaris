import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileBarChart, Download, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  title: string;
  brand_name: string;
}

interface ReportHistory {
  created_at: string;
  brand_name: string;
  from_date: string;
  to_date: string;
  url: string;
}

export default function ReportsGenerator() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch campaigns
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('id, title, brand_name')
          .order('created_at', { ascending: false });

        if (campaignError) throw campaignError;
        setCampaigns(campaignData || []);

        // Fetch report history
        const { data: reportData, error: reportError } = await supabase
          .from('report_links')
          .select(`
            created_at, from_date, to_date, url,
            campaigns!inner(brand_name)
          `)
          .order('created_at', { ascending: false });

        if (reportError) throw reportError;
        
        const formattedReports = (reportData || []).map(report => ({
          created_at: report.created_at,
          brand_name: report.campaigns?.brand_name || 'Unknown Brand',
          from_date: report.from_date,
          to_date: report.to_date,
          url: report.url
        }));

        setReportHistory(formattedReports);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateReport = async () => {
    if (!selectedCampaign || !fromDate || !toDate) {
      toast({
        title: "Missing Information",
        description: "Please select a campaign and date range",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportUrl = `https://example.com/reports/${Date.now()}`;
      
      // Save to report history
      const { error } = await supabase
        .from('report_links')
        .insert({
          campaign_id: selectedCampaign,
          from_date: fromDate,
          to_date: toDate,
          url: reportUrl
        });

      if (error) throw error;

      toast({
        title: "Report Generated",
        description: "Your brand report has been created successfully",
      });

      // Refresh report history
      window.location.reload();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Brand Reports</h1>
          <p className="text-muted-foreground mt-1">Generate professional reports for your brand partnerships</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Brand Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate professional reports for your brand partnerships
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Generator */}
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="w-5 h-5" />
              Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="campaign">Campaign</Label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.brand_name} - {campaign.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from_date">From Date</Label>
                <Input
                  id="from_date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="to_date">To Date</Label>
                <Input
                  id="to_date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={generateReport} 
              disabled={generating}
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
            >
              {generating ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <FileBarChart className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Report History */}
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Report History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportHistory.length === 0 ? (
              <div className="text-center py-8">
                <FileBarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No reports generated yet</p>
                <p className="text-sm text-muted-foreground">
                  Generate your first report to see it here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportHistory.map((report, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {report.brand_name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {report.from_date} to {report.to_date}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={report.url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-1" />
                              Download
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
    </div>
  );
}