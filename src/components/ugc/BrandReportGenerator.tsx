import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileText, Download, Share, Zap } from 'lucide-react';
import { toast } from '../ui/use-toast';

export default function BrandReportGenerator() {
  const handleGenerateReport = () => {
    toast({
      title: "Report Generated!",
      description: "Your brand report is ready for download with Growth OS watermark.",
    });
  };

  const handleShareReport = () => {
    toast({
      title: "Share Link Created",
      description: "Report link copied to clipboard - share with brands easily!",
    });
  };

  const recentReports = [
    { brand: 'Beauty Co.', campaign: 'Summer Launch', date: '2 days ago', status: 'delivered' },
    { brand: 'Fashion Brand', campaign: 'Fall Collection', date: '1 week ago', status: 'pending' },
    { brand: 'Tech Startup', campaign: 'Product Launch', date: '2 weeks ago', status: 'delivered' }
  ];

  return (
    <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Brand Report Generator</h3>
        <Zap className="w-5 h-5 text-growth-primary" />
      </div>

      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-2">
          <Button onClick={handleGenerateReport} className="w-full" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Generate New Report
          </Button>
          <Button onClick={handleShareReport} variant="outline" className="w-full" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share Report Link
          </Button>
        </div>

        {/* Recent Reports */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Reports</h4>
          {recentReports.map((report, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <div>
                <div className="font-medium text-sm">{report.brand}</div>
                <div className="text-xs text-muted-foreground">{report.campaign}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={report.status === 'delivered' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {report.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Watermark Info */}
        <div className="p-2 rounded-lg bg-growth-primary/5 border border-growth-primary/20">
          <div className="text-xs text-muted-foreground text-center">
            All reports include "Powered by Growth OS" watermark
          </div>
        </div>
      </div>
    </Card>
  );
}