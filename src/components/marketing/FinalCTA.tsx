import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import AuthForm from '@/components/AuthForm';

export function FinalCTA() {
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
    <section id="final-cta" className="container py-24 lg:py-32">
      <div className="text-center space-y-12">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold lg:text-6xl max-w-4xl mx-auto">
            Ready to win more
            <span className="bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent">
              {" "}brand deals?
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join creators who are already using Growth OS to prove their value and secure bigger brand partnerships.
          </p>
        </div>

        <Button size="lg" onClick={handleGetStarted} className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
          Create my account
        </Button>

        {showAuth && (
          <div className="max-w-md mx-auto mt-12 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl">
            <AuthForm />
          </div>
        )}
      </div>
    </section>
  );
}