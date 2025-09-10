import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Filters {
  from: Date | null;
  to: Date | null;
  platform: string | null;
}

interface Campaign {
  id: string;
  campaign_name: string;
}

interface Props {
  filters: Filters;
  onClose: () => void;
}

export default function ReportGeneratorModal({ filters, onClose }: Props) {
  const [from, setFrom] = useState<Date | null>(filters.from);
  const [to, setTo] = useState<Date | null>(filters.to);
  const [campaignId, setCampaignId] = useState<string>('all');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: campaignsData, error } = await supabase
        .from('campaigns')
        .select('id, campaign_name')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
      } else {
        setCampaigns(campaignsData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateReport = async () => {
    if (!from || !to) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      // TODO: Implement actual report generation API
      const reportData = {
        role: "ugc_creator",
        from: from.toISOString(),
        to: to.toISOString(),
        campaign_id: campaignId === 'all' ? null : campaignId
      };

      // Mock report generation
      console.log('Generating report with data:', reportData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockReportUrl = `https://example.com/reports/${Date.now()}.pdf`;

      // Save report link to database
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { error } = await supabase
          .from('report_links')
          .insert({
            user_id: user.user.id,
            campaign_id: campaignId === 'all' ? null : campaignId,
            from_date: from.toISOString().split('T')[0],
            to_date: to.toISOString().split('T')[0],
            url: mockReportUrl,
            title: `UGC Report - ${format(from, 'MMM dd')} to ${format(to, 'MMM dd')}`
          });

        if (error) {
          console.error('Error saving report link:', error);
        }
      }

      toast({
        title: "Report Generated",
        description: "Your UGC performance report has been generated successfully",
      });

      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Generate UGC Report</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {from ? format(from, "MMM dd, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={from || undefined}
                  onSelect={setFrom}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {to ? format(to, "MMM dd, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={to || undefined}
                  onSelect={setTo}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label>Campaign (Optional)</Label>
          <Select value={campaignId} onValueChange={setCampaignId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.campaign_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={generateReport} 
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </div>
    </>
  );
}