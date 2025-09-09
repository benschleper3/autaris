import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText } from 'lucide-react';
import CreatorAnalyticsKPIs from './CreatorAnalyticsKPIs';
import BestTimeAnalytics from './BestTimeAnalytics';
import PerformanceTrends from './PerformanceTrends';
import BestPostsTable from './BestPostsTable';
import AIInsightsPanel from './AIInsightsPanel';
import PlatformBreakdown from './PlatformBreakdown';

export default function CreatorDashboard() {
  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-background to-background/80">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-growth-primary to-growth-secondary bg-clip-text text-transparent">
            Creator Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Understand what's working and optimize your content strategy
          </p>
        </div>
        <Button className="gradient-primary text-white shadow-lg">
          <FileText className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Row */}
      <CreatorAnalyticsKPIs />

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Performance Trends - Full Width */}
        <div className="xl:col-span-3">
          <PerformanceTrends />
        </div>

        {/* Best Time to Post */}
        <div className="xl:col-span-2">
          <BestTimeAnalytics />
        </div>

        {/* Platform Breakdown */}
        <div className="xl:col-span-1">
          <PlatformBreakdown />
        </div>

        {/* Best Posts Table - Full Width */}
        <div className="xl:col-span-3">
          <BestPostsTable />
        </div>

        {/* AI Insights - Full Width */}
        <div className="xl:col-span-3">
          <AIInsightsPanel />
        </div>
      </div>
    </div>
  );
}