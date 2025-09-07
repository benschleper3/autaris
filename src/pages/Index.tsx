import { useState, useEffect } from 'react';
import { supabase } from '@/lib/config';
import AuthForm from '@/components/AuthForm';
import Dashboard from '@/components/Dashboard';
import Navigation from '@/components/Navigation';
import Onboarding from '@/components/Onboarding';
import UGCDashboard from '@/components/ugc/UGCDashboard';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setNeedsOnboarding(false);
      }
    });

    initializeAuth();
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setNeedsOnboarding(!data?.onboarded);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
    // Refetch profile to get updated role
    if (user) {
      fetchUserProfile(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome to Growth OS
            </h1>
            <p className="text-muted-foreground mt-2">
              Your all-in-one social media analytics platform
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  // Show onboarding if user needs it
  if (needsOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navigation />
      {profile?.role === 'ugc_creator' ? <UGCDashboard /> : <Dashboard />}
      <Toaster />
    </div>
  );
};

export default Index;
