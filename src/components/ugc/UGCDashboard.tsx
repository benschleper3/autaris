import Dashboard from '../Dashboard';
import ContentPerformanceTracker from './ContentPerformanceTracker';
import BrandReportGenerator from './BrandReportGenerator';
import PortfolioBuilder from './PortfolioBuilder';
import RevenueTracker from './RevenueTracker';
import AIGrowthInsights from './AIGrowthInsights';
import CampaignDashboard from './CampaignDashboard';

export default function UGCDashboard() {
  return (
    <div className="space-y-6">
      {/* Standard Growth OS Dashboard */}
      <Dashboard />
      
      {/* UGC-Specific Modules */}
      <div className="p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* UGC Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-growth-primary to-growth-secondary bg-clip-text text-transparent mb-2">
            UGC Creator Tools
          </h2>
          <p className="text-muted-foreground text-sm">
            Specialized tools for content creators and brand partnerships
          </p>
        </div>

        {/* Content Performance & Revenue - Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <ContentPerformanceTracker />
          <RevenueTracker />
        </div>

        {/* Brand Report & Portfolio - Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <BrandReportGenerator />
          <PortfolioBuilder />
        </div>

        {/* AI Insights & Campaign Dashboard - Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <AIGrowthInsights />
          <CampaignDashboard />
        </div>
      </div>
    </div>
  );
}