import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import AuthForm from '@/components/AuthForm';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { 
  BarChart3, 
  Clock, 
  Zap, 
  Users, 
  Target, 
  FileText, 
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Calendar,
  PieChart,
  Briefcase
} from 'lucide-react';

const steps = [
  {
    number: "01",
    title: "Connect Your Accounts",
    description: "Link your social media accounts across Instagram, TikTok, YouTube, and other platforms. Our secure integration pulls your content data automatically.",
    icon: Users,
    features: ["Instagram integration", "TikTok analytics", "YouTube metrics", "Multi-platform sync"]
  },
  {
    number: "02", 
    title: "AI Analysis & Insights",
    description: "Our AI analyzes your content performance, engagement patterns, and audience behavior to identify what makes your posts successful.",
    icon: Zap,
    features: ["Content style analysis", "Engagement prediction", "Audience insights", "Performance trends"]
  },
  {
    number: "03",
    title: "Optimize Posting Times",
    description: "Get personalized recommendations on when to post for maximum engagement based on your unique audience patterns.",
    icon: Clock,
    features: ["Optimal timing heatmaps", "Platform-specific schedules", "Audience activity tracking", "Performance forecasting"]
  },
  {
    number: "04",
    title: "Track Campaign Performance",
    description: "Manage brand partnerships, track deliverables, and monitor campaign ROI all in one centralized dashboard.",
    icon: Target,
    features: ["Campaign tracking", "Deliverable management", "ROI calculations", "Brand collaboration tools"]
  },
  {
    number: "05",
    title: "Build Your Portfolio",
    description: "Showcase your best work with automatically generated portfolios that highlight your top-performing content and key metrics.",
    icon: Briefcase,
    features: ["Auto-generated portfolios", "Best content curation", "Performance highlights", "Professional presentation"]
  },
  {
    number: "06",
    title: "Generate Professional Reports",
    description: "Create stunning reports for brands with key performance metrics, insights, and recommendations that help secure bigger deals.",
    icon: FileText,
    features: ["Branded reports", "Key metrics visualization", "Performance insights", "Deal-closing data"]
  }
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Increase Engagement",
    description: "Optimize your content strategy with AI-powered insights that boost engagement rates by up to 40%."
  },
  {
    icon: Calendar,
    title: "Perfect Timing",
    description: "Post when your audience is most active with personalized scheduling recommendations."
  },
  {
    icon: PieChart,
    title: "Data-Driven Decisions",
    description: "Make informed content decisions backed by comprehensive analytics and performance data."
  },
  {
    icon: CheckCircle,
    title: "Secure More Deals",
    description: "Professional reports and portfolio presentations help you negotiate better brand partnerships."
  }
];

export default function HowItWorks() {
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      navigate('/dashboard');
    } else {
      setShowAuth(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container py-16 lg:py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <Badge variant="secondary" className="px-4 py-2">
            How Growth OS Works
          </Badge>
          
          <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
            From content to
            <span className="bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent">
              {" "}cash flow
            </span>
            <br />
            in 6 simple steps
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Growth OS streamlines your entire content creation and monetization process. Here's exactly how we help you grow your audience and increase your earnings.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="container py-16">
        <div className="space-y-24">
          {steps.map((step, index) => (
            <div key={step.number} className={`grid gap-12 lg:grid-cols-2 lg:gap-16 ${index % 2 === 1 ? 'lg:grid-cols-2' : ''}`}>
              <div className={`space-y-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      Step {step.number}
                    </Badge>
                  </div>
                  
                  <h2 className="text-3xl font-bold lg:text-4xl">
                    {step.title}
                  </h2>
                  
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {step.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-growth-accent/20 rounded-3xl flex items-center justify-center mx-auto">
                      <step.icon className="w-12 h-12 text-primary" />
                    </div>
                    <div className="text-6xl font-bold text-muted-foreground/20">
                      {step.number}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-16 lg:py-24">
        <div className="text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold lg:text-5xl">
              Why creators choose
              <span className="bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent">
                {" "}Growth OS
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of creators who've transformed their content strategy and increased their earnings.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border-border/50 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 lg:py-24">
        <Card className="p-12 bg-gradient-to-r from-primary/10 to-growth-accent/10 border-border/50 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Ready to transform your content strategy?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start your journey today and see why thousands of creators trust Growth OS to grow their audience and earnings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
              Get started for free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => document.getElementById('screenshots')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View sample report
            </Button>
          </div>

          {showAuth && (
            <div className="max-w-md mx-auto mt-8 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl">
              <AuthForm />
            </div>
          )}
        </Card>
      </section>

      <Footer />
    </div>
  );
}