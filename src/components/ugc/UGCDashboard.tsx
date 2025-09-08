import ContentPerformanceTracker from './ContentPerformanceTracker';
import BrandReportGenerator from './BrandReportGenerator';
import PortfolioBuilder from './PortfolioBuilder';
import RevenueTracker from './RevenueTracker';
import AIGrowthInsights from './AIGrowthInsights';
import CampaignDashboard from './CampaignDashboard';
import MetricCard from '../MetricCard';
import MetricCardFollowers from '../MetricCardFollowers';
import MetricCardReach from '../MetricCardReach';
import ActivityChart from '../ActivityChart';
import TopPosts from '../TopPosts';
import InsightsPreview from '../InsightsPreview';
import PlatformCards from '../PlatformCards';
import { Users, Eye, Heart, TrendingUp } from 'lucide-react';

export default function UGCDashboard() {
  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-growth-primary to-growth-secondary bg-clip-text text-transparent mb-2">
          Creator Dashboard
        </h1>
        <p className="text-muted-foreground">
          Complete analytics and tools for content creators and brand partnerships
        </p>
      </div>

      {/* Platform Cards */}
      <PlatformCards />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <MetricCardFollowers />
        <MetricCardReach />
        <MetricCard
          title="Engagement Rate"
          value="7.8%"
          change="+2.1%"
          changeType="positive"
          icon={<Heart className="w-4 h-4 sm:w-5 sm:h-5" />}
        />
        <MetricCard
          title="Growth Rate"
          value="4.2%"
          change="-0.3%"
          changeType="negative"
          icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
        />
      </div>

      {/* Analytics and Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Activity Chart - Takes up 2 columns on desktop */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <ActivityChart />
        </div>
        
        {/* Insights Preview - Shows first on mobile */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <InsightsPreview />
        </div>
      </div>

      {/* Content Performance & Revenue - Creator Tools Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <ContentPerformanceTracker />
        <RevenueTracker />
      </div>

      {/* Brand Report & Portfolio - Creator Tools Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <BrandReportGenerator />
        <PortfolioBuilder />
      </div>

      {/* AI Insights & Campaign Dashboard - Creator Tools Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <AIGrowthInsights />
        <CampaignDashboard />
      </div>

      {/* Top Posts */}
      <div className="grid grid-cols-1">
        <TopPosts />
      </div>
    </div>
  );
}