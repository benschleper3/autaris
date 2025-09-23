import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, FolderOpen, Code, Home } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import GlobalFilters from './GlobalFilters';
import KPIStrip from './KPIStrip';
import TrendChart from './TrendChart';
import PlatformBreakdown from './PlatformBreakdown';
import PostingHeatmap from './PostingHeatmap';
import TopPostsTable from './TopPostsTable';
import AIInsightsList from './AIInsightsList';
import ReportGeneratorModal from './ReportGeneratorModal';
import PortfolioManagerModal from './PortfolioManagerModal';
import ExportAppJsonModal from './ExportAppJsonModal';

export default function UnifiedAnalyticsDashboard() {
  const { isOwnerOrAdmin } = useUserRole();
  
  const [filters, setFilters] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(), // today
    platform: 'all'
  });
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <GlobalFilters filters={filters} onFiltersChange={setFilters} />
      
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-growth-primary to-growth-secondary bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your content performance and optimize your strategy
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowReportModal(true)} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
            <Button onClick={() => setShowPortfolioModal(true)} variant="outline" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Portfolio Manager
            </Button>
            {isOwnerOrAdmin && (
              <Button onClick={() => setShowExportModal(true)} variant="outline" size="sm" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Export App JSON
              </Button>
            )}
          </div>
        </div>

        {/* KPI Strip */}
        <KPIStrip filters={filters} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Performance Trends - Full Width */}
          <div className="xl:col-span-3">
            <TrendChart filters={filters} />
          </div>

          {/* Platform Breakdown */}
          <div className="xl:col-span-1">
            <PlatformBreakdown filters={filters} />
          </div>

          {/* Posting Heatmap */}
          <div className="xl:col-span-2">
            <PostingHeatmap filters={filters} />
          </div>

          {/* Top Posts Table - Full Width */}
          <div className="xl:col-span-3">
            <TopPostsTable filters={filters} />
          </div>

          {/* AI Insights - Full Width */}
          <div className="xl:col-span-3">
            <AIInsightsList filters={filters} />
          </div>
        </div>
      </div>

      <ReportGeneratorModal open={showReportModal} onOpenChange={setShowReportModal} />
      <PortfolioManagerModal open={showPortfolioModal} onOpenChange={setShowPortfolioModal} />
      <ExportAppJsonModal open={showExportModal} onOpenChange={setShowExportModal} />
    </div>
  );
}