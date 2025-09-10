import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, FileText, FolderOpen, Sparkles, Eye, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import UGCKPICards from './UGCKPICards';
import UGCPerformanceTrend from './UGCPerformanceTrend';
import UGCPlatformBreakdown from './UGCPlatformBreakdown';
import UGCBestTimeHeatmap from './UGCBestTimeHeatmap';
import UGCTopPosts from './UGCTopPosts';
import UGCInsights from './UGCInsights';
import ReportGeneratorModal from './ReportGeneratorModal';
import PortfolioManagerModal from './PortfolioManagerModal';

interface Filters {
  from: Date | null;
  to: Date | null;
  platform: string | null;
}

export default function UGCAnalyticsDashboard() {
  const [filters, setFilters] = useState<Filters>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
    platform: null
  });

  const [showReportModal, setShowReportModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">From:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.from ? format(filters.from, "MMM dd, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.from || undefined}
                  onSelect={(date) => updateFilter('from', date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">To:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.to ? format(filters.to, "MMM dd, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.to || undefined}
                  onSelect={(date) => updateFilter('to', date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Platform:</span>
            <Select value={filters.platform || ""} onValueChange={(value) => updateFilter('platform', value || null)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Report Generator
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <ReportGeneratorModal 
                  filters={filters}
                  onClose={() => setShowReportModal(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showPortfolioModal} onOpenChange={setShowPortfolioModal}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Portfolio Manager
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <PortfolioManagerModal onClose={() => setShowPortfolioModal(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            UGC Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive analytics for your user-generated content campaigns
          </p>
        </div>

        {/* KPI Strip */}
        <UGCKPICards filters={filters} />

        {/* Performance Trend */}
        <UGCPerformanceTrend filters={filters} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Breakdown */}
          <UGCPlatformBreakdown filters={filters} />

          {/* Best Time Heatmap */}
          <UGCBestTimeHeatmap filters={filters} />
        </div>

        {/* Top Posts */}
        <UGCTopPosts filters={filters} />

        {/* AI Insights */}
        <UGCInsights filters={filters} />
      </div>
    </div>
  );
}