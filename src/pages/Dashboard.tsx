import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UnifiedAnalyticsDashboard from '@/components/unified/UnifiedAnalyticsDashboard';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Handle TikTok OAuth callback query params
  useEffect(() => {
    const url = new URL(window.location.href);
    const connected = url.searchParams.get('connected');
    const error = url.searchParams.get('error');

    if (connected === 'tiktok') {
      toast({
        title: 'Success',
        description: 'TikTok connected successfully 🎉',
      });
      // Clean the URL
      url.searchParams.delete('connected');
      window.history.replaceState({}, '', url.toString());
    } else if (error) {
      toast({
        title: 'Error',
        description: `TikTok connection failed: ${decodeURIComponent(error)}`,
        variant: 'destructive',
      });
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [toast]);

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

  return <UnifiedAnalyticsDashboard />;
}