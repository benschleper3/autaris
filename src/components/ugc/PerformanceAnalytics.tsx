import PerformanceTrends from './PerformanceTrends';
import BestTimeHeatmap from './BestTimeHeatmap';
import PlatformBreakdown from './PlatformBreakdown';

export default function PerformanceAnalytics() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Performance Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Deep insights into your content performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends - Full Width */}
        <div className="lg:col-span-2">
          <PerformanceTrends />
        </div>

        {/* Platform Breakdown */}
        <PlatformBreakdown />

        {/* Best Time Heatmap */}
        <BestTimeHeatmap />
      </div>
    </div>
  );
}