import { BarChart, FileChartColumn, Brain, Folder } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-powered insights",
      description: "Get personalized recommendations based on your unique content style, audience behavior, and performance patterns. AI analyzes what works for you specifically."
    },
    {
      icon: FileChartColumn,
      title: "Brand-ready reports",
      description: "Generate professional, shareable reports that highlight your ROI and make it easy for brands to say yes."
    },
    {
      icon: Folder,
      title: "Portfolio builder",
      description: "Create stunning portfolios that showcase your best work. Easily share your content performance and case studies with potential brand partners."
    }
  ];

  return (
    <section id="features" className="container py-24 lg:py-32">
      <div className="text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold lg:text-5xl">
            Everything you need to
            <span className="bg-gradient-to-r from-primary to-autaris-accent bg-clip-text text-transparent">
              {" "}win more deals
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop losing brand opportunities because you can't show your value. Autaris makes your impact impossible to ignore.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group bg-card/30 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 relative overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-autaris-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-autaris-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}