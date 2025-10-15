import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { supabase } from '@/integrations/supabase/client';

interface ConnectTikTokButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

function nonce() {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
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

  const handleClick = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[ConnectTikTok] No user found');
      return;
    }

    const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
    const redirectUri = encodeURIComponent('https://gjfbxqsjxasubvnpeeie.supabase.co/functions/v1/tiktok-callback');
    const scopes = encodeURIComponent('user.info.basic,user.info.stats');
    const state = btoa(JSON.stringify({ userId: user.id, n: nonce(), ts: Date.now() }));
    
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scopes}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
    
    console.log('[ConnectTikTok] Redirecting to TikTok OAuth');
    window.location.href = authUrl;
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setTimeout(() => handleClick(), 100);
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
