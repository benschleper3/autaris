import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Video, BarChart3, Camera } from 'lucide-react';
import UGCKPICards from './UGCKPICards';
import ActiveCampaigns from './ActiveCampaigns';
import DeliverablesKanban from './DeliverablesKanban';
import RevenueTracker from './RevenueTracker';
import PricingSuggestions from './PricingSuggestions';
import BestTimeHeatmap from './BestTimeHeatmap';

export default function UGCCreatorDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-growth-primary to-growth-secondary bg-clip-text text-transparent">
            UGC Creator Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage brand campaigns → create content → get paid
          </p>
        </div>
        <Button className="bg-gradient-to-r from-growth-primary to-growth-secondary text-white">
          <BarChart3 className="w-4 h-4 mr-2" />
          Generate Brand Report
        </Button>
      </div>

      {/* KPI Row */}
      <UGCKPICards />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Campaigns */}
        <div className="lg:col-span-2">
          <ActiveCampaigns />
        </div>

        {/* Deliverables Kanban */}
        <div className="lg:col-span-2">
          <DeliverablesKanban />
        </div>

        {/* Revenue Tracker */}
        <RevenueTracker />

        {/* Pricing Suggestions */}
        <PricingSuggestions />

        {/* Best Time to Post */}
        <div className="lg:col-span-2">
          <BestTimeHeatmap />
        </div>
      </div>
    </div>
  );
}