import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hidden component that fixes incomplete TikTok connection data on mount
 * This runs once when the dashboard loads to sync existing sandbox data
 */
export function FixTikTokConnection() {
  useEffect(() => {
    const fixConnection = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if we need to fix the connection
        const { data: account } = await supabase
          .from('social_accounts')
          .select('display_name')
          .eq('user_id', user.id)
          .eq('platform', 'tiktok')
          .maybeSingle();

        // Only fix if account exists but display_name is missing
        if (account && !account.display_name) {
          console.log('[FixTikTokConnection] Fixing incomplete TikTok connection...');
          const { error } = await supabase.rpc('fix_tiktok_connection');
          if (error) {
            console.error('[FixTikTokConnection] Error:', error);
          } else {
            console.log('[FixTikTokConnection] Successfully fixed connection data');
            // Reload the page to refresh the dashboard with new data
            window.location.reload();
          }
        }
      } catch (err) {
        console.error('[FixTikTokConnection] Unexpected error:', err);
      }
    };

    fixConnection();
  }, []);

  return null; // This component doesn't render anything
}
