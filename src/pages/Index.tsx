import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import Onboarding from '@/components/Onboarding';
import Navigation from '@/components/Navigation';

const Index = () => {
  const [user, setUser] = useState(null);
  const [userMeta, setUserMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Check if user has completed onboarding
        const { data: userMetaData } = await supabase
          .from('user_meta')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
          
        if (userMetaData) {
          setUserMeta(userMetaData);
        } else {
          setShowOnboarding(true);
        }
      }
      setLoading(false);
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // Check user meta when auth state changes
        const { data: userMetaData } = await supabase
          .from('user_meta')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
          
        if (userMetaData) {
          setUserMeta(userMetaData);
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
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
        .single()
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
