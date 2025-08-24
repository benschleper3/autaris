import MetricCard from './MetricCard';
import ActivityChart from './ActivityChart';
import TopPosts from './TopPosts';
import InsightsPreview from './InsightsPreview';
import PlatformCards from './PlatformCards';
import { Users, Eye, Heart, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Platform Cards */}
      <PlatformCards />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Followers"
          value="26.4K"
          change="+8.2%"
          changeType="positive"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Weekly Reach"
          value="89.2K"
          change="+12.5%"
          changeType="positive"
          icon={<Eye className="w-5 h-5" />}
        />
        <MetricCard
          title="Engagement Rate"
          value="7.8%"
          change="+2.1%"
          changeType="positive"
          icon={<Heart className="w-5 h-5" />}
        />
        <MetricCard
          title="Growth Rate"
          value="4.2%"
          change="-0.3%"
          changeType="negative"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Charts and Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        
        {/* Insights Preview */}
        <div className="lg:col-span-1">
          <InsightsPreview />
        </div>
      </div>

      {/* Top Posts */}
      <div className="grid grid-cols-1">
        <TopPosts />
      </div>
    </div>
  );
}