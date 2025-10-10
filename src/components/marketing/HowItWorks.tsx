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
    <section id="how" className="container py-24 lg:py-32 relative">
      <div className="text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold lg:text-5xl">How it works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From data to deals in three simple steps. Start winning more brand partnerships today.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Animated Connector Lines */}
          <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-1">
            <div className="h-full bg-gradient-to-r from-primary via-autaris-accent to-autaris-purple rounded-full opacity-30" />
            <div className="h-full bg-gradient-to-r from-primary via-autaris-accent to-autaris-purple rounded-full animate-pulse-slow absolute inset-0" />
          </div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
              <Card className="group bg-card/30 backdrop-blur-sm border-border/50 h-full hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-autaris-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="text-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-autaris-accent rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-autaris-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
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