import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { connectTikTok } from '@/lib/tiktok';
import { supabase } from '@/integrations/supabase/client';

interface ConnectTikTokButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function ConnectTikTokButton({ 
  variant = 'default', 
  size = 'default',
  className,
  children = 'Connect TikTok'
}: ConnectTikTokButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (isAuthenticated) {
      // User is signed in, go straight to TikTok OAuth
      connectTikTok();
    } else {
      // User is not signed in, show auth modal
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    // After successful sign-in, immediately continue to TikTok OAuth
    setShowAuthModal(false);
    setTimeout(() => connectTikTok(), 100);
  };

  return (
    <>
      <Button 
        onClick={handleClick} 
        variant={variant}
        size={size}
        className={className}
        disabled={loading}
      >
        {children}
      </Button>
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
