import { Link2, BarChart3, Share } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function HowItWorks() {
  const steps = [
    {
      step: 1,
      icon: Link2,
      title: "Connect TikTok",
      description: "Securely link your TikTok account to automatically sync your recent posts and performance metrics."
    },
    {
      step: 2,
      icon: BarChart3,
      title: "See insights",
      description: "View your KPIs, performance trends, best posting times, and top-performing content all in one dashboard."
    },
    {
      step: 3,
      icon: Share,
      title: "Share results", 
      description: "Generate a branded report link that showcases your value and makes it easy for brands to understand your impact."
    }
  ];

  return (
    <section id="how" className="container py-24 lg:py-32 bg-muted/20">
      <div className="text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold lg:text-5xl">How it works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From data to deals in three simple steps. Start winning more brand partnerships today.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Connector Lines */}
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/50 to-growth-accent/50" />
          
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-growth-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    {step.step}
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-center">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}