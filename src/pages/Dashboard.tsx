import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UGCAnalyticsDashboard from '@/components/ugc/UGCAnalyticsDashboard';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          return;
        }
        setUser(session.user);

        // Set user role if not exists
        const { data: userMetaData } = await supabase
          .from('user_meta')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!userMetaData) {
          await supabase.rpc('set_user_role', { p_role: 'ugc_creator' });
        }
      } catch (e) {
        console.error('[Dashboard] access check failed', e);
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

  return <UGCAnalyticsDashboard />;
}