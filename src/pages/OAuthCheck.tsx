import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_URL } from '@/integrations/supabase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CheckResult {
  passed: boolean;
  message: string;
  data?: any;
}

interface Diagnostics {
  generated_at_iso: string;
  app_base_url: string;
  tiktok_redirect_uri: string;
  expected_redirect_uri: string;
  match: boolean;
  sandbox: boolean;
  endpoints: {
    start_dryrun?: { status: number; redirect_uri?: string; scopes?: string[] };
    callback_dryrun?: { status: number };
    sync_probe?: { status: number };
  };
  notes: string[];
}

export default function OAuthCheck() {
  const [loading, setLoading] = useState(false);
  const [envSummary, setEnvSummary] = useState<any>(null);
  const [checks, setChecks] = useState<Record<string, CheckResult>>({});
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [authUrl, setAuthUrl] = useState<string>('');

  const maskMiddle = (str: string) => {
    if (!str || str.length < 8) return str;
    const len = str.length;
    const visible = Math.floor(len * 0.3);
    return str.slice(0, visible) + '•'.repeat(len - visible * 2) + str.slice(-visible);
  };

  const loadEnvSummary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call tiktok-start with dryrun to get env info
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/tiktok-start?dryrun=1`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch env summary');
      
      const data = await response.json();

      // Use custom domain as expected base
      const appBase = 'https://www.autaris.company';
      const redirectUri = data?.redirect_uri || '';
      const clientId = data?.client_key || '';
      const sandbox = data?.sandbox === true;
      const scopes = data?.scopes || [];

      setEnvSummary({
        app_base_url: appBase,
        tiktok_client_id: clientId,
        tiktok_redirect_uri: redirectUri,
        tiktok_scopes: scopes.join(', '),
        sandbox_tiktok: sandbox,
        user_email: user?.email,
        user_id: user?.id
      });
    } catch (err) {
      console.error('Failed to load env summary:', err);
      toast({
        title: "Error",
        description: "Could not load environment summary",
        variant: "destructive"
      });
    }
  };

  const runChecks = async () => {
    setLoading(true);
    const results: Record<string, CheckResult> = {};
    const notes: string[] = [];
    const endpoints: Diagnostics['endpoints'] = {};

    try {
      // 1. Check secrets present
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        toast({
          title: "Not authenticated",
          description: "Please log in to run checks",
          variant: "destructive"
        });
        return;
      }

      const startResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/tiktok-start?dryrun=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!startResponse.ok) {
        results.secrets = {
          passed: false,
          message: 'Failed to fetch secrets information',
          data: { error: `HTTP ${startResponse.status}` }
        };
        notes.push('Could not verify secrets - check if TIKTOK_CLIENT_ID, TIKTOK_REDIRECT_URI are set');
      } else {
        const startData = await startResponse.json();
        const hasClientId = !!startData.client_key;
        const hasRedirectUri = !!startData.redirect_uri;
        
        results.secrets = {
          passed: hasClientId && hasRedirectUri,
          message: hasClientId && hasRedirectUri 
            ? 'All required secrets present' 
            : `Missing: ${!hasClientId ? 'TIKTOK_CLIENT_ID ' : ''}${!hasRedirectUri ? 'TIKTOK_REDIRECT_URI' : ''}`,
          data: { hasClientId, hasRedirectUri }
        };

        if (!hasClientId || !hasRedirectUri) {
          notes.push('Set missing secrets in Supabase Edge Function settings');
        }

        // 2. Domain match check
        const appBase = 'https://www.autaris.company';
        const expectedRedirect = `${appBase}/functions/v1/tiktok-callback`;
        const actualRedirect = startData?.redirect_uri || '';
        const match = expectedRedirect === actualRedirect;

        results.domain_match = {
          passed: match,
          message: match 
            ? 'Redirect URI matches expected value' 
            : `Mismatch: Expected "${expectedRedirect}", Got "${actualRedirect}"`,
          data: { expected: expectedRedirect, actual: actualRedirect }
        };

        if (!match) {
          notes.push(`Set TikTok Redirect URI in TikTok dev console and Supabase secrets to: ${expectedRedirect}`);
        }

        // 3. /tiktok-start availability
        endpoints.start_dryrun = {
          status: 200,
          redirect_uri: startData?.redirect_uri,
          scopes: startData?.scopes || []
        };

        const expectedScopes = ['user.info.basic', 'user.info.stats'];
        const actualScopes = startData?.scopes || [];
        const scopesMatch = expectedScopes.every(s => actualScopes.includes(s));
        const extraScopes = actualScopes.filter(s => !expectedScopes.includes(s));

        results.start_endpoint = {
          passed: !!startData && actualRedirect === expectedRedirect && scopesMatch,
          message: !!startData 
            ? `Endpoint reachable. ${extraScopes.length > 0 ? `Extra scopes: ${extraScopes.join(', ')}` : 'Scopes OK'}` 
            : 'Endpoint not reachable',
          data: { redirect_uri: actualRedirect, scopes: actualScopes }
        };

        if (extraScopes.length > 0) {
          notes.push(`Warning: Extra scopes detected: ${extraScopes.join(', ')}`);
        }

        // 4. /tiktok-callback availability
        try {
          const callbackResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/tiktok-callback?dryrun=1`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const callbackData = callbackResponse.ok ? await callbackResponse.json() : null;

          endpoints.callback_dryrun = {
            status: callbackResponse.status
          };

          results.callback_endpoint = {
            passed: callbackResponse.ok && callbackData?.ok === true,
            message: callbackData?.ok ? 'Callback endpoint reachable' : 'Callback endpoint not reachable',
            data: callbackData
          };

          if (!callbackResponse.ok) {
            notes.push('Callback endpoint returned error - check edge function logs');
          }
        } catch (err) {
          endpoints.callback_dryrun = { status: 500 };
          results.callback_endpoint = {
            passed: false,
            message: 'Failed to reach callback endpoint',
            data: { error: err }
          };
          notes.push('Callback endpoint failed - ensure tiktok-callback function is deployed');
        }

        // 5. Start flow preview
        if (startData?.auth_url_preview) {
          setAuthUrl(startData.auth_url_preview);
          results.flow_preview = {
            passed: true,
            message: 'Auth URL generated successfully',
            data: { url: startData.auth_url_preview }
          };
        }

        // 6. Sync probe (optional)
        try {
          const syncResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/tiktok-sync`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ dryrun: true })
            }
          );

          endpoints.sync_probe = {
            status: syncResponse.status
          };

          results.sync_probe = {
            passed: syncResponse.ok,
            message: syncResponse.ok ? 'Sync endpoint reachable' : 'Sync endpoint not reachable',
            data: {}
          };
        } catch (err) {
          // Sync is optional, don't fail on this
          endpoints.sync_probe = { status: 404 };
          results.sync_probe = {
            passed: false,
            message: 'Sync endpoint not found (optional)',
            data: {}
          };
        }

        // Build diagnostics
        const diag: Diagnostics = {
          generated_at_iso: new Date().toISOString(),
          app_base_url: appBase,
          tiktok_redirect_uri: actualRedirect,
          expected_redirect_uri: expectedRedirect,
          match,
          sandbox: startData?.sandbox === true,
          endpoints,
          notes
        };

        setDiagnostics(diag);
        setChecks(results);
      }
    } catch (err) {
      console.error('Error running checks:', err);
      toast({
        title: "Check Failed",
        description: "An error occurred while running checks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyDiagnostics = () => {
    if (!diagnostics) return;
    
    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
    toast({
      title: "Copied!",
      description: "Diagnostics JSON copied to clipboard"
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">TikTok OAuth Checker</h1>
          <p className="text-muted-foreground">Verify your TikTok OAuth configuration and endpoints</p>
        </div>

        {/* Configuration Reminders */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Required Configuration Steps</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
              <li>Set <strong>APP_BASE_URL=https://www.autaris.company</strong> in Supabase Edge Function secrets</li>
              <li>Set <strong>TIKTOK_REDIRECT_URI=https://www.autaris.company/functions/v1/tiktok-callback</strong> in secrets</li>
              <li>Update TikTok Developer Portal → App Info → Redirect URI to match above</li>
              <li>Ensure DNS TXT record for domain verification is added (if required by TikTok)</li>
              <li>Add tester accounts in TikTok Developer Portal → Sandbox → Testers</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Environment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Summary</CardTitle>
            <CardDescription>Current configuration (secrets masked)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={loadEnvSummary} variant="outline" size="sm" className="mb-4">
              Load Environment Info
            </Button>
            
            {envSummary && (
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">APP_BASE_URL:</span>
                  <span>{envSummary.app_base_url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TIKTOK_CLIENT_ID:</span>
                  <span>{maskMiddle(envSummary.tiktok_client_id)} ({envSummary.tiktok_client_id?.length || 0} chars)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">TIKTOK_REDIRECT_URI:</span>
                  <a 
                    href={envSummary.tiktok_redirect_uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {envSummary.tiktok_redirect_uri}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">TIKTOK_SCOPES:</span>
                  <span className="text-xs">{envSummary.tiktok_scopes || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SANDBOX_TIKTOK:</span>
                  <Badge variant={envSummary.sandbox_tiktok ? "secondary" : "default"}>
                    {envSummary.sandbox_tiktok ? 'true (sandbox mode)' : 'false (production mode)'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User Email:</span>
                  <span>{envSummary.user_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="text-xs">{envSummary.user_id}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Run Checks */}
        <Card>
          <CardHeader>
            <CardTitle>OAuth Checks</CardTitle>
            <CardDescription>Validate configuration and endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={runChecks} disabled={loading}>
                {loading ? 'Running Checks...' : 'Run Checks'}
              </Button>
              {diagnostics && (
                <Button onClick={copyDiagnostics} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Diagnostics
                </Button>
              )}
            </div>

            {Object.keys(checks).length > 0 && (
              <div className="space-y-3">
                {Object.entries(checks).map(([key, result]) => (
                  <div key={key} className="flex items-start gap-3 p-3 border rounded-lg">
                    {result.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground break-words">{result.message}</p>
                    </div>
                  </div>
                ))}

                {authUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        TikTok Authorization Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Note: This is a preview URL. The real flow happens automatically without the dryrun parameter.
                      </p>
                      <code className="text-xs break-all block bg-muted p-2 rounded">{authUrl}</code>
                      <Button 
                        onClick={() => window.open(authUrl, '_blank', 'noopener,noreferrer')}
                        className="w-full"
                        variant="outline"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open TikTok Authorize Preview
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {diagnostics && Object.values(checks).some(c => !c.passed) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Configuration Issues Detected</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {diagnostics.notes.map((note, idx) => (
                      <li key={idx} className="text-sm">{note}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Diagnostics JSON */}
        {diagnostics && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnostics JSON</CardTitle>
              <CardDescription>Complete diagnostic output</CardDescription>
            </CardHeader>
            <CardContent>
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
