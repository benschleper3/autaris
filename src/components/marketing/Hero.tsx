import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function Hero() {
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section id="hero" className="container py-24 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
              <span className="bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent">
                Prove your value.
              </span>
              <br />
              <span className="text-foreground">Grow your deals.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground lg:text-2xl max-w-lg">
              Growth OS is the complete analytics platform for content creators and UGC professionals. Track performance across all platforms, optimize posting times with AI that adapts to your unique content style, manage campaigns, build portfolios, and generate professional reports that secure bigger brand deals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
              Get started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => document.getElementById('screenshots')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View a sample report
            </Button>
          </div>

        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-md space-y-4">
            {/* KPI Cards Mock */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Growth</p>
                    <p className="font-semibold">+24.5%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-growth-secondary/10 rounded-lg">
                    <Users className="w-4 h-4 text-growth-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reach</p>
                    <p className="font-semibold">1.2M</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Mini Chart Mock */}
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Performance Trend</h3>
                  <Badge variant="secondary" className="text-xs">This Week</Badge>
                </div>
                <div className="h-16 bg-gradient-to-r from-primary/20 to-growth-accent/20 rounded-lg flex items-end space-x-1 p-2">
                  {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-primary to-growth-accent rounded-sm opacity-80"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </Card>

            {/* Best Time Heatmap Mock */}
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-growth-accent" />
                  <h3 className="text-sm font-medium">Best Posting Times</h3>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 21 }, (_, i) => (
                    <div 
                      key={i}
                      className={`aspect-square rounded-sm ${
                        Math.random() > 0.5 ? 'bg-primary/80' : 
                        Math.random() > 0.3 ? 'bg-primary/40' : 'bg-muted/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}