import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UnifiedAnalyticsDashboard from '@/components/unified/UnifiedAnalyticsDashboard';
import { toast } from 'sonner';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Check for successful TikTok connection
    if (searchParams.get('connected') === 'tiktok') {
      console.log('[Dashboard] TikTok connected successfully');
      toast.success('TikTok account connected successfully!');
      // Remove the query param
      setSearchParams({});
      // Trigger refresh of connection status
      setRefreshKey(prev => prev + 1);
    }
    
    // Check for TikTok connection errors
    const error = searchParams.get('error');
    if (error) {
      console.error('[Dashboard] TikTok connection error:', error);
      const decodedError = decodeURIComponent(error);
      
      // Show user-friendly message for common errors, or the raw error for debugging
      const errorMap: Record<string, string> = {
        'access_denied': 'You denied TikTok authorization',
        'missing_code': 'TikTok did not provide authorization code',
        'missing_state': 'Invalid OAuth state',
        'invalid_state': 'Invalid OAuth state - please try again',
        'token_exchange_failed': 'Failed to exchange authorization code'
      };
      
      // Check if it's a known error type
      const knownError = Object.keys(errorMap).find(key => decodedError.startsWith(key));
      const message = knownError 
        ? errorMap[knownError]
        : `TikTok connection failed: ${decodedError}`;
      
      toast.error(message);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

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

  return <UnifiedAnalyticsDashboard key={refreshKey} />;
}