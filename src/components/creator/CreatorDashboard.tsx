import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Phone, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import CreatorKPICards from './CreatorKPICards';
import ContentAttributionTable from './ContentAttributionTable';
import PipelineKanban from './PipelineKanban';
import BookingsCalendar from './BookingsCalendar';
import BestTimeHeatmap from './BestTimeHeatmap';
import AIInsightsCreator from './AIInsightsCreator';
import LinkHubPerformance from './LinkHubPerformance';

export default function CreatorDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-growth-primary to-growth-secondary bg-clip-text text-transparent">
            Creator Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Turn content into leads → calls → clients → revenue
          </p>
        </div>
        <Button className="bg-gradient-to-r from-growth-primary to-growth-secondary text-white">
          <BarChart3 className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* KPI Row */}
      <CreatorKPICards />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Attribution */}
        <div className="lg:col-span-2">
          <ContentAttributionTable />
        </div>

        {/* Pipeline Kanban */}
        <div className="lg:col-span-2">
          <PipelineKanban />
        </div>

        {/* Bookings Calendar */}
        <BookingsCalendar />

        {/* Best Time to Post */}
        <BestTimeHeatmap />

        {/* AI Insights */}
        <AIInsightsCreator />

        {/* Link Hub Performance */}
        <LinkHubPerformance />
      </div>
    </div>
  );
}