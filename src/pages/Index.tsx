import { useState, useEffect } from 'react';
import { supabase } from '@/lib/config';
import AuthForm from '@/components/AuthForm';
import Dashboard from '@/components/Dashboard';
import Navigation from '@/components/Navigation';

const Index = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="p-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-semibold">Growth OS Dashboard</h1>
        <div className="flex gap-2">
          <a 
            href="/debug/run-sql"
            className="px-3 py-1 text-sm rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Run SQL  
          </a>
          <a 
            href="/debug/seed"
            className="px-3 py-1 text-sm rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Basic Seed
          </a>
          <a 
            href="/debug/seed-full"
            className="px-3 py-1 text-sm rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Full Seed
          </a>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
      <Navigation />
      <Dashboard />
    </div>
  );
};

export default Index;
