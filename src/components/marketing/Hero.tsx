import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Users, Clock, BarChart3 } from 'lucide-react';
import { WaitlistForm } from './WaitlistForm';
import dashboardPreview from '@/assets/dashboard-preview-mockup.png';

export function Hero() {
  const [showWaitlist, setShowWaitlist] = useState(false);


  return (
    <section id="hero" className="container py-24 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
              <span className="bg-gradient-to-r from-primary to-autaris-accent bg-clip-text text-transparent">
                Prove your value.
              </span>
              <br />
              <span className="text-foreground">Grow your deals.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground lg:text-2xl max-w-lg">
              Autaris is the complete analytics platform for content creators and UGC professionals. Track performance across all platforms, optimize posting times with AI that adapts to your unique content style, manage campaigns, build portfolios, and generate professional reports that secure bigger brand deals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Dialog open={showWaitlist} onOpenChange={setShowWaitlist}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Join Waitlist
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <WaitlistForm onSuccess={() => setShowWaitlist(false)} />
              </DialogContent>
            </Dialog>
          </div>

        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-2xl">
            {/* Dashboard Preview */}
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Dashboard Preview</h3>
                  <Badge variant="secondary" className="text-xs">Live Analytics</Badge>
                </div>
                <img 
                  src={dashboardPreview} 
                  alt="Autaris Analytics Dashboard with real-time data showing 2.4M total views, 6.8% engagement rate, performance trends, platform breakdown across TikTok, Instagram, and YouTube, and best posting times heatmap"
                  className="w-full rounded-lg shadow-lg border border-border/50"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Track performance across all platforms with advanced analytics
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}