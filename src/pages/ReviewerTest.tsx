import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_URL } from '@/integrations/supabase/config';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface KPIs {
  views_30d: number;
  avg_er_30d: number;
  posts_30d: number;
  active_campaigns: number;
}

interface TrendPoint {
  day: string;
  day_views: number;
  avg_er_percent: number;
}

interface HeatmapCell {
  platform: string;
  dow: number;
  hour: number;
  avg_engagement_percent: number;
  posts_count: number;
}

interface TopPost {
  post_id: string;
  title: string;
  platform: string;
  views: number;
  engagement_rate: number;
  url: string;
}

interface TikTokAccount {
  handle: string;
  follower_count: number;
  last_synced_at: string;
}

interface DiagnosticsData {
  generated_at_iso: string;
  user_id: string;
  user_email: string;
  domain: string;
  sandbox: boolean;
  oauth: {
    redirect_uri: string;
    status: string;
  };
  db_checks: {
    social_accounts: {
      has_tiktok_row: boolean;
      last_synced_at: string | null;
    };
    posts_count_90d: number;
    metrics_rows_90d: number;
  };
  kpis_sample: KPIs | null;
  trend_points: number;
  heatmap_cells: number;
  top_posts_count: number;
}

export default function ReviewerTest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [tiktokAccount, setTikTokAccount] = useState<TikTokAccount | null>(null);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [copiedDiagnostics, setCopiedDiagnostics] = useState(false);

  const last30Days = {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  };

  const maskUrl = (url: string) => {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.host}${u.pathname}`;
    } catch {
      return url;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthenticated(true);
        setUserEmail(user.email || '');
        setUserId(user.id);
        await fetchTikTokAccount();
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthenticated(false);
    }
  };

  const fetchTikTokAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_accounts')
        .select('handle, last_synced_at')
        .eq('user_id', user.id)
        .eq('platform', 'tiktok')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setTikTokAccount({
          handle: data.handle || '',
          follower_count: 0,
          last_synced_at: data.last_synced_at || '',
        });
      }
    } catch (error) {
      console.error('Error fetching TikTok account:', error);
    }
  };

  const handleStartTikTokLogin = () => {
    const functionUrl = `${SUPABASE_URL}/functions/v1/tiktok-start`;
    window.location.href = functionUrl;
  };

  const handleCheckStatus = async () => {
    setLoading({ ...loading, status: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAuthenticated(false);
        toast({
          title: 'Not Authenticated',
          description: 'Please sign in first.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/analytics-kpis?from=${last30Days.from}&to=${last30Days.to}&platform=all`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setAuthenticated(true);
        await fetchTikTokAccount();
        toast({
          title: 'Authenticated ✅',
          description: 'Successfully verified authentication.',
        });
      } else {
        setAuthenticated(false);
        toast({
          title: 'Authentication Failed',
          description: 'Could not verify authentication.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Status check error:', error);
      toast({
        title: 'Error',
        description: 'Failed to check authentication status.',
        variant: 'destructive',
      });
    } finally {
      setLoading({ ...loading, status: false });
    }
  };

  const handleRunSync = async () => {
    setLoading({ ...loading, sync: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Not Authenticated',
          description: 'Please sign in first.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/tiktok-sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Sync Complete',
          description: 'TikTok data has been synced successfully.',
        });
        await fetchAllAnalytics();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Sync Failed',
          description: errorData.error || 'Could not sync TikTok data.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Error',
        description: 'Failed to run TikTok sync.',
        variant: 'destructive',
      });
    } finally {
      setLoading({ ...loading, sync: false });
    }
  };

  const fetchAllAnalytics = async () => {
    setLoading({ ...loading, analytics: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      // Fetch KPIs
      const kpisResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/analytics-kpis?from=${last30Days.from}&to=${last30Days.to}&platform=all`,
        { headers }
      );
      if (kpisResponse.ok) {
        const kpisData = await kpisResponse.json();
        setKpis({
          views_30d: kpisData.views_30d || 0,
          avg_er_30d: kpisData.avg_er_30d || 0,
          posts_30d: kpisData.posts_30d || 0,
          active_campaigns: kpisData.active_campaigns || 0,
        });
      }

      // Fetch Trend
      const trendResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/analytics-trend?from=${last30Days.from}&to=${last30Days.to}&platform=all`,
        { headers }
      );
      if (trendResponse.ok) {
        const trendData = await trendResponse.json();
        setTrend(trendData.rows || []);
      }

      // Fetch Heatmap
      const heatmapResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/analytics-heatmap`,
        { headers }
      );
      if (heatmapResponse.ok) {
        const heatmapData = await heatmapResponse.json();
        setHeatmap(heatmapData.rows || []);
      }

      // Fetch Top Posts
      const topPostsResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/analytics-top-posts?limit=10`,
        { headers }
      );
      if (topPostsResponse.ok) {
        const topPostsData = await topPostsResponse.json();
        setTopPosts(topPostsData.rows || []);
      }

      await generateDiagnostics();
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data.',
        variant: 'destructive',
      });
    } finally {
      setLoading({ ...loading, analytics: false });
    }
  };

  const handleGenerateInsights = async () => {
    setLoading({ ...loading, insights: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Not Authenticated',
          description: 'Please sign in first.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/insights-generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Insights Saved',
          description: 'AI insights have been generated successfully.',
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Insights Generation Failed',
          description: errorData.error || 'Could not generate insights.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Insights generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate insights.',
        variant: 'destructive',
      });
    } finally {
      setLoading({ ...loading, insights: false });
    }
  };

  const generateDiagnostics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get posts count (90 days)
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      // Get metrics count (90 days)
      const { count: metricsCount } = await supabase
        .from('post_metrics')
        .select('post_metrics.*, posts!inner(user_id)', { count: 'exact', head: true })
        .eq('posts.user_id', user.id)
        .gte('captured_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      const diagnosticsData: DiagnosticsData = {
        generated_at_iso: new Date().toISOString(),
        user_id: userId,
        user_email: userEmail,
        domain: maskUrl(window.location.origin),
        sandbox: true, // Always true for this environment
        oauth: {
          redirect_uri: maskUrl(`${SUPABASE_URL}/functions/v1/tiktok-callback`),
          status: authenticated ? 'authenticated' : 'not_authenticated',
        },
        db_checks: {
          social_accounts: {
            has_tiktok_row: !!tiktokAccount,
            last_synced_at: tiktokAccount?.last_synced_at || null,
          },
          posts_count_90d: postsCount || 0,
          metrics_rows_90d: metricsCount || 0,
        },
        kpis_sample: kpis,
        trend_points: trend.length,
        heatmap_cells: heatmap.length,
        top_posts_count: topPosts.length,
      };

      setDiagnostics(diagnosticsData);
    } catch (error) {
      console.error('Diagnostics generation error:', error);
    }
  };

  const copyDiagnostics = () => {
    if (diagnostics) {
      navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
      setCopiedDiagnostics(true);
      toast({
        title: 'Copied',
        description: 'Diagnostics JSON copied to clipboard.',
      });
      setTimeout(() => setCopiedDiagnostics(false), 2000);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchAllAnalytics();
    }
  }, [authenticated]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Reviewer Test Console</h1>
          <p className="text-muted-foreground">
            End-to-end verification of TikTok Login + Sync + Analytics (sandbox)
          </p>
        </div>

        {/* Reviewer Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Reviewer Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Click "Start TikTok Login", approve in sandbox.</li>
              <li>Return here and click "Check Status".</li>
              <li>Click "Run TikTok Sync".</li>
              <li>Verify analytics load.</li>
              <li>Click "Copy Diagnostics" and include it in review notes.</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Environment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Summary</CardTitle>
            <CardDescription>Read-only configuration information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">APP_BASE_URL:</div>
              <div className="text-muted-foreground">{maskUrl(window.location.origin)}</div>
              
              <div className="font-medium">Supabase URL:</div>
              <div className="text-muted-foreground">{SUPABASE_URL}</div>
              
              <div className="font-medium">SANDBOX_TIKTOK:</div>
              <div className="text-muted-foreground">
                <Badge variant="outline">true</Badge>
              </div>
              
              <div className="font-medium">User Email:</div>
              <div className="text-muted-foreground">{userEmail || 'Not loaded'}</div>
              
              <div className="font-medium">User ID:</div>
              <div className="text-muted-foreground font-mono text-xs">{userId || 'Not loaded'}</div>
            </div>
            <Alert className="mt-4">
              <AlertDescription>
                <strong>Running in TikTok Sandbox.</strong> Data is limited to test accounts.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 1: TikTok Login */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: TikTok Login (Sandbox)</CardTitle>
            <CardDescription>
              If already connected, you'll still be redirected back here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleStartTikTokLogin}>
              Start TikTok Login
            </Button>
          </CardContent>
        </Card>

        {/* Step 2: Callback Status */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Callback Status</CardTitle>
            <CardDescription>Verify authentication status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCheckStatus}
              disabled={loading.status}
            >
              {loading.status && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check Status
            </Button>
            
            {authenticated === true && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Authenticated ✅</strong>
                  {tiktokAccount && (
                    <div className="mt-2 space-y-1 text-sm">
                      <div>Handle: @{tiktokAccount.handle}</div>
                      <div>Last Synced: {tiktokAccount.last_synced_at ? new Date(tiktokAccount.last_synced_at).toLocaleString() : 'Never'}</div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {authenticated === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Not Authenticated</strong> - Please sign in first.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Sync Data */}
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Sync Data</CardTitle>
            <CardDescription>Sync TikTok data from sandbox</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRunSync}
              disabled={loading.sync || !authenticated}
            >
              {loading.sync && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run TikTok Sync
            </Button>
          </CardContent>
        </Card>

        {/* Step 4: Live Analytics Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Live Analytics Preview</CardTitle>
            <CardDescription>View real-time analytics data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading.analytics && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            
            {/* KPIs Panel */}
            {kpis && (
              <div>
                <h3 className="font-semibold mb-3">KPIs (Last 30 Days)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold">{kpis.views_30d.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Views</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold">{kpis.avg_er_30d.toFixed(2)}%</div>
                    <div className="text-sm text-muted-foreground">Avg ER</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold">{kpis.posts_30d}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold">{kpis.active_campaigns}</div>
                    <div className="text-sm text-muted-foreground">Active Campaigns</div>
                  </div>
                </div>
              </div>
            )}

            {/* Trend Summary */}
            {trend.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Trend Data ({trend.length} points)</h3>
                <div className="text-sm text-muted-foreground">
                  Date range: {trend[0]?.day} to {trend[trend.length - 1]?.day}
                </div>
              </div>
            )}

            {/* Heatmap Summary */}
            {heatmap.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Heatmap Data ({heatmap.length} cells)</h3>
                <div className="text-sm text-muted-foreground">
                  Platforms: {[...new Set(heatmap.map(h => h.platform))].join(', ')}
                </div>
              </div>
            )}

            {/* Top Posts Table */}
            {topPosts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Top Posts ({topPosts.length})</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">ER %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topPosts.slice(0, 5).map((post) => (
                        <TableRow key={post.post_id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>{post.platform}</TableCell>
                          <TableCell className="text-right">{post.views.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{post.engagement_rate.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 5: AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Step 5: AI Insights (Optional)</CardTitle>
            <CardDescription>Generate weekly insights</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGenerateInsights}
              disabled={loading.insights || !authenticated}
            >
              {loading.insights && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Insights
            </Button>
          </CardContent>
        </Card>

        {/* Diagnostics JSON */}
        {diagnostics && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnostics JSON</CardTitle>
              <CardDescription>Copyable diagnostics for review notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={copyDiagnostics}
                variant="outline"
              >
                {copiedDiagnostics ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Diagnostics
                  </>
                )}
              </Button>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
