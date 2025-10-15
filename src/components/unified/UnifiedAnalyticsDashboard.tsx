import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, FolderOpen, Code, Home, RefreshCw, Link2, Unlink } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { connectTikTok } from '@/lib/tiktok';
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
import { CleanupTikTokButton } from '../CleanupTikTokButton';

interface UnifiedAnalyticsDashboardProps {
  refreshTrigger?: number;
}

export default function UnifiedAnalyticsDashboard({ refreshTrigger }: UnifiedAnalyticsDashboardProps = {}) {
  const { isOwnerOrAdmin } = useUserRole();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(), // today
    platform: 'all'
  });
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  // Check connection on mount and when refreshTrigger changes
  useEffect(() => {
    checkTikTokConnection();
  }, [refreshTrigger]);

  const checkTikTokConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('social_accounts')
        .select('display_name')
        .eq('user_id', user.id)
        .eq('platform', 'tiktok')
        .maybeSingle();

      setTiktokConnected(!!data?.display_name);
    } catch (error) {
      console.error('Error checking TikTok connection:', error);
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleTikTokConnect = () => {
    connectTikTok();
  };

  const handleTikTokDisconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', 'tiktok');

      if (error) throw error;

      setTiktokConnected(false);
      toast({
        title: "Disconnected",
        description: "TikTok account has been disconnected."
      });
    } catch (error) {
      console.error('Error disconnecting TikTok:', error);
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect TikTok account.",
        variant: "destructive"
      });
    }
  };

  const handleSyncData = async () => {
    try {
      setSyncing(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        'https://gjfbxqsjxasubvnpeeie.supabase.co/functions/v1/tiktok-sync',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      if (!data.ok) throw new Error(data.error);

      toast({
        title: "Sync Complete",
        description: `Synced ${data.synced.posts} posts and ${data.synced.metrics} metrics from TikTok.`
      });

      // Trigger refresh by updating filters slightly
      setFilters({ ...filters });
    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: "Sync Failed",
        description: "Could not sync TikTok data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  // Show empty state if no TikTok account is connected
  if (!checkingConnection && !tiktokConnected) {
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
              <Button 
                onClick={handleTikTokConnect} 
                variant="default" 
                className="flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Connect TikTok
              </Button>
              {isOwnerOrAdmin && (
                <>
                  <Button onClick={() => setShowExportModal(true)} variant="outline" size="sm" className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Export App JSON
                  </Button>
                  <CleanupTikTokButton />
                </>
              )}
            </div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="rounded-full bg-primary/10 p-8">
              <Link2 className="w-16 h-16 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">No TikTok Account Connected</h2>
              <p className="text-muted-foreground max-w-md">
                Connect your TikTok account to start tracking your content performance, viewing analytics, and getting AI-powered insights.
              </p>
            </div>
            <Button 
              onClick={handleTikTokConnect} 
              size="lg"
              className="flex items-center gap-2"
            >
              <Link2 className="w-5 h-5" />
              Connect TikTok Account
            </Button>
          </div>
        </div>

        <ReportGeneratorModal open={showReportModal} onOpenChange={setShowReportModal} />
        <PortfolioManagerModal open={showPortfolioModal} onOpenChange={setShowPortfolioModal} />
        <ExportAppJsonModal open={showExportModal} onOpenChange={setShowExportModal} />
      </div>
    );
  }

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
            {tiktokConnected ? (
              <>
                <Button onClick={handleSyncData} disabled={syncing} variant="default" className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync TikTok Data'}
                </Button>
                <Button onClick={handleTikTokDisconnect} variant="outline" className="flex items-center gap-2">
                  <Unlink className="w-4 h-4" />
                  Disconnect TikTok
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleTikTokConnect} 
                disabled={checkingConnection}
                variant="default" 
                className="flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                {checkingConnection ? 'Checking...' : 'Connect TikTok'}
              </Button>
            )}
            <Button onClick={() => setShowReportModal(true)} variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
            <Button onClick={() => setShowPortfolioModal(true)} variant="outline" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Portfolio Manager
            </Button>
            {isOwnerOrAdmin && (
              <>
                <Button onClick={() => setShowExportModal(true)} variant="outline" size="sm" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Export App JSON
                </Button>
                <CleanupTikTokButton />
              </>
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