import { SUPABASE_URL } from '@/integrations/supabase/config';
import { supabase } from '@/integrations/supabase/client';

/**
 * Navigate to TikTok OAuth
 * Calls the edge function first to get the auth URL, then navigates
 */
export async function connectTikTok() {
  try {
    console.log('[TikTok] Starting OAuth flow...');
    
    // Call edge function with auth to get the TikTok auth URL
    const { data, error } = await supabase.functions.invoke('tiktok-start', {
      method: 'GET',
    });

    if (error) {
      console.error('[TikTok] Error getting auth URL:', error);
      throw new Error(`Failed to get TikTok auth URL: ${error.message}`);
    }

    // Verify we got a valid redirect URL
    if (!data?.redirect_url) {
      console.error('[TikTok] No redirect URL in response:', data);
      throw new Error('No redirect URL received from server');
    }

    console.log('[TikTok] Redirecting to:', data.redirect_url);
    
    // Use window.location.assign for better redirect handling
    window.location.assign(data.redirect_url);
  } catch (err) {
    console.error('[TikTok] Connection error:', err);
    alert(`Failed to connect to TikTok: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}
