import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import Onboarding from '@/components/Onboarding';

const Index = () => {
  const [user, setUser] = useState(null);
  const [userMeta, setUserMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => { console.log('[Index] mount');
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Check if user has completed onboarding
          const { data: userMetaData } = await supabase
            .from('user_meta')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (userMetaData) {
            setUserMeta(userMetaData);
          } else {
            // Set default role as ugc_creator for new users
            await supabase
              .from('user_meta')
              .insert({ user_id: session.user.id, role: 'ugc_creator' });
            setShowOnboarding(true);
          }
        }
      } catch (e) {
        console.error('Init auth error', e);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Defer fetching meta to avoid deadlocks
        setTimeout(async () => {
          const { data: userMetaData } = await supabase
            .from('user_meta')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();
          if (userMetaData) {
            setUserMeta(userMetaData);
            setShowOnboarding(false);
          } else {
            setShowOnboarding(true);
          }
        }, 0);
      } else {
        setUser(null);
        setUserMeta(null);
        setShowOnboarding(false);
      }
    });

    initializeAuth();
    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh user meta
    if (user) {
      supabase
        .from('user_meta')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setUserMeta(data);
          }
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome to Growth OS
            </h1>
            <p className="text-muted-foreground mt-2">
              Your all-in-one creator business platform
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  // Show onboarding if user hasn't selected a role yet
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Redirect to appropriate dashboard based on role
  if (userMeta?.role === 'creator') {
    return <Navigate to="/dashboard-creator" replace />;
  }
  
  if (userMeta?.role === 'ugc_creator') {
    return <Navigate to="/dashboard-ugc" replace />;
  }

  // Fallback - show onboarding if no role is set
  return <Onboarding onComplete={handleOnboardingComplete} />;
};

export default Index;
