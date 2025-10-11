import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { WaitlistForm } from './WaitlistForm';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function Hero() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const navigate = useNavigate();

  const handleTikTokLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    
    // Direct top-level navigation to TikTok OAuth
    window.location.href = 'https://gjfbxqsjxasubvnpeeie.supabase.co/functions/v1/tiktok-start';
  };


  return (
    <section id="hero" className="container py-32 lg:py-40 relative">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-autaris-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      
      <div className="flex flex-col justify-center items-center text-center space-y-10 max-w-5xl mx-auto relative z-10">
        <div className="space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4 animate-pulse-slow">
            🚀 The Future of Creator Analytics
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight lg:text-7xl leading-tight">
            <span className="bg-gradient-to-r from-primary via-autaris-accent to-autaris-purple bg-clip-text text-transparent animate-gradient inline-block">
              Prove your value.
            </span>
            <br />
            <span className="text-foreground">Grow your deals.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground lg:text-2xl max-w-3xl mx-auto leading-relaxed">
            The complete analytics platform for content creators and UGC professionals. Track performance, optimize with AI, and generate professional reports that secure bigger brand deals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Button 
            size="lg" 
            onClick={handleTikTokLogin}
            className="bg-gradient-to-r from-primary to-autaris-accent hover:opacity-90 transition-all text-lg px-8 py-6 glow-effect"
          >
            Login with TikTok
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Dialog open={showWaitlist} onOpenChange={setShowWaitlist}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                Join Waitlist
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <WaitlistForm onSuccess={() => setShowWaitlist(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}