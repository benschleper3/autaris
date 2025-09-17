import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Download, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportAppJsonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportAppJsonModal({ open, onOpenChange }: ExportAppJsonModalProps) {
  const [appJson, setAppJson] = useState<any>(null);
  const [displayJson, setDisplayJson] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [prettyFormat, setPrettyFormat] = useState(true);
  const [redactionEnabled, setRedactionEnabled] = useState(true);
  const { toast } = useToast();

  // Mock app definition - in a real implementation, this would come from the IDE/platform API
  const getAppDefinition = () => {
    return {
      projectId: "analytics-dashboard",
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      routes: [
        { path: "/", component: "Index" },
        { path: "/dashboard", component: "Dashboard" },
        { path: "/dashboard-ugc", redirect: "/dashboard" }
      ],
      components: [
        "UnifiedAnalyticsDashboard",
        "GlobalFilters", 
        "KPIStrip",
        "TrendChart",
        "PlatformBreakdown",
        "PostingHeatmap",
        "TopPostsTable",
        "AIInsightsList"
      ],
      database: {
        tables: ["user_meta", "posts", "campaigns", "portfolio_items"],
        views: ["v_posts_with_latest", "v_time_heatmap"],
        functions: ["get_ugc_kpis", "get_daily_perf"]
      },
      integrations: {
        supabase: {
          enabled: true,
          url: "***REDACTED***",
          anon_key: "***REDACTED***",
          service_role_key: "***REDACTED***"
        }
      },
      webhooks: {
        postInsights: "https://your-n8n-domain.com/webhook/post-insights",
        aiInsights: "https://your-n8n-domain.com/webhook/ai-insights", 
        generateReport: "https://your-n8n-domain.com/webhook/generate-report"
      },
      secrets: {
        OPENAI_API_KEY: "***REDACTED***",
        JWT_SECRET: "***REDACTED***"
      }
    };
  };

  const redactSensitiveData = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      // Check if string looks like a JWT or long secret
      if (typeof obj === 'string' && (obj.length > 32 || obj.startsWith('ey'))) {
        return '***REDACTED***';
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(redactSensitiveData);
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // Always redact high-risk keys
      const alwaysRedact = ['service_role', 'service_role_key', 'password', 'private_key'].includes(lowerKey);
      
      // Conditionally redact other sensitive keys if redaction is enabled
      const sensitiveKeys = ['api_key', 'apikey', 'authorization', 'auth', 'token', 'secret', 'bearer', 'header', 'headers'];
      const shouldRedact = alwaysRedact || (redactionEnabled && sensitiveKeys.some(sk => lowerKey.includes(sk)));
      
      if (shouldRedact) {
        result[key] = '***REDACTED***';
      } else {
        result[key] = redactSensitiveData(value);
      }
    }
    return result;
  };

  useEffect(() => {
    if (open && !appJson) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const rawJson = getAppDefinition();
        setAppJson(rawJson);
        setLoading(false);
      }, 500);
    }
  }, [open]);

  useEffect(() => {
    if (appJson) {
      const processedJson = redactSensitiveData(appJson);
      const jsonString = prettyFormat 
        ? JSON.stringify(processedJson, null, 2)
        : JSON.stringify(processedJson);
      setDisplayJson(jsonString);
    }
  }, [appJson, prettyFormat, redactionEnabled]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(displayJson);
      toast({ description: "Copied app JSON to clipboard" });
    } catch (error) {
      toast({ description: "Failed to copy JSON", variant: "destructive" });
    }
  };

  const downloadJson = () => {
    const blob = new Blob([displayJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ description: "App JSON downloaded" });
  };

  const jsonSizeKB = Math.round(new TextEncoder().encode(displayJson).length / 1024);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Entire App JSON</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Controls */}
          <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="pretty-format" 
                  checked={prettyFormat} 
                  onCheckedChange={setPrettyFormat} 
                />
                <Label htmlFor="pretty-format">Pretty Format</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="redaction" 
                  checked={redactionEnabled} 
                  onCheckedChange={setRedactionEnabled} 
                />
                <Label htmlFor="redaction">Redaction</Label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={loading}>
                <Copy className="w-4 h-4 mr-2" />
                Copy JSON
              </Button>
              <Button variant="outline" size="sm" onClick={downloadJson} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </div>

          {/* Warning when redaction is off */}
          {!redactionEnabled && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Redaction disabled. High-risk secrets (service_role, passwords) remain masked.
              </AlertDescription>
            </Alert>
          )}

          {/* JSON Viewer */}
          <div className="flex-1 min-h-0 relative">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="ml-2">Loading app definition...</span>
              </div>
            ) : (
              <pre className="h-full w-full overflow-auto bg-muted p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
                {displayJson}
              </pre>
            )}
          </div>

          {/* Footer */}
          <div className="text-sm text-muted-foreground text-center">
            {jsonSizeKB} KB • Sensitive values are redacted
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}