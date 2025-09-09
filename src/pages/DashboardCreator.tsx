import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import CreatorDashboard from '@/components/creator/CreatorDashboard';
import Navigation from '@/components/Navigation';

export default function DashboardCreator() {
  const [user, setUser] = useState(null);
  const [userMeta, setUserMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      
      setUser(session.user);
      
      // Check user role
      const { data: userMetaData } = await supabase
        .from('user_meta')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
        
      setUserMeta(userMetaData);
      setLoading(false);
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

  if (userMeta?.role !== 'creator') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navigation />
      <CreatorDashboard />
    </div>
  );
}