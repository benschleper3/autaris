import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Clock, FileText } from 'lucide-react';

export function Screenshots() {
  const mockScreenshots = [
    {
      title: "Dashboard KPIs",
      description: "Real-time performance metrics at a glance",
      icon: TrendingUp,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Total Views</p>
              <p className="font-bold text-lg">2.4M</p>
            </div>
            <div className="bg-growth-secondary/10 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Engagement</p>
              <p className="font-bold text-lg">8.2%</p>
            </div>
          </div>
          <div className="bg-muted/40 h-12 rounded-lg flex items-end space-x-1 p-2">
            {[60, 80, 45, 90, 75, 95, 70].map((height, i) => (
              <div 
                key={i} 
                className="flex-1 bg-primary rounded-sm"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Trend & Heatmap",
      description: "Discover when your audience is most active",
      icon: Clock,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }, (_, i) => (
              <div 
                key={i}
                className={`aspect-square rounded-sm ${
                  Math.random() > 0.6 ? 'bg-primary' : 
                  Math.random() > 0.4 ? 'bg-primary/60' : 
                  Math.random() > 0.2 ? 'bg-primary/30' : 'bg-muted/40'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
          </div>
        </div>
      )
    },
    {
      title: "Top Posts",
      description: "Your best performing content ranked",
      icon: Users,
      content: (
        <div className="space-y-2">
          {[
            { views: "890K", engagement: "12.4%" },
            { views: "670K", engagement: "9.8%" },
            { views: "420K", engagement: "11.2%" }
          ].map((post, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-muted/20 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-growth-accent rounded" />
                <div>
                  <p className="text-xs font-medium">Post #{i + 1}</p>
                  <p className="text-xs text-muted-foreground">{post.views} views</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">{post.engagement}</Badge>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Report Example",
      description: "Brand-ready reports that close deals",
      icon: FileText,
      content: (
        <div className="space-y-3">
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-sm">Creator Performance Report</h4>
            <p className="text-xs text-muted-foreground">Campaign: Brand Partnership Q1</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
              <span className="text-xs">Total Reach</span>
              <span className="font-medium text-xs">1.2M</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
              <span className="text-xs">Engagement Rate</span>
              <span className="font-medium text-xs">8.4%</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-primary/10 rounded">
              <span className="text-xs">ROI Delivered</span>
              <span className="font-medium text-xs text-primary">340%</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="screenshots" className="container py-24 lg:py-32">
      <div className="text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold lg:text-5xl">See it in action</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get a preview of the powerful analytics and reporting tools that help creators win more brand deals.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {mockScreenshots.map((screenshot, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-colors">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <screenshot.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg text-left">{screenshot.title}</CardTitle>
                <CardDescription className="text-left">
                  {screenshot.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-background/50 p-4 rounded-lg">
                  {screenshot.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}