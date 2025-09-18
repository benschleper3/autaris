import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import AuthForm from '@/components/AuthForm';

export function Pricing() {
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

  const plans = [
    {
      name: "Starter",
      price: "Free trial",
      description: "Perfect for new creators testing the waters",
      features: [
        "Connect TikTok account",
        "Basic performance reports", 
        "Posting time heatmap",
        "Email support"
      ],
      cta: "Get started",
      popular: false
    },
    {
      name: "Pro", 
      price: "$19/mo",
      description: "For serious creators ready to scale",
      features: [
        "Everything in Starter",
        "Weekly AI insights",
        "Portfolio builder",
        "Advanced analytics",
        "Priority support"
      ],
      cta: "Get started",
      popular: true
    }
  ];

  return (
    <section id="pricing" className="container py-24 lg:py-32">
      <div className="text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold lg:text-5xl">
            Simple, transparent
            <span className="bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent">
              {" "}pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
          <Badge variant="outline" className="text-sm">
            🚀 Founders pricing — subject to change
          </Badge>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-colors ${
                plan.popular ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center space-y-4">
                <div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </div>
                <div className="space-y-1">
                  <p className="text-4xl font-bold">{plan.price}</p>
                  {plan.price.includes('$') && (
                    <p className="text-sm text-muted-foreground">Billed monthly</p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={handleGetStarted}
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {showAuth && (
          <div className="max-w-md mx-auto mt-12 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl">
            <AuthForm />
          </div>
        )}
      </div>
    </section>
  );
}