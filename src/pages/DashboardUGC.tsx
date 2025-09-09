import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UGCCreatorDashboard from '@/components/ugc/UGCCreatorDashboard';
import Navigation from '@/components/Navigation';

export default function DashboardUGC() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          return;
        }
        setUser(session.user);

        // Check user role
        const { data: userMetaData } = await supabase
          .from('user_meta')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        setProfile(userMetaData || null);
      } catch (e) {
        console.error('[DashboardUGC] access check failed', e);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.role !== 'ugc_creator') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navigation />
      <UGCCreatorDashboard />
    </div>
  );
}