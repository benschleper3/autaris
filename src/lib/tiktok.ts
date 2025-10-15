import { SUPABASE_URL } from '@/integrations/supabase/config';
import { supabase } from '@/integrations/supabase/client';

/**
 * Navigate to TikTok OAuth
 * Calls the edge function first to get the auth URL, then navigates
 */
export async function connectTikTok() {
  console.log('[connectTikTok] Starting TikTok OAuth flow...');
  
  try {
    // Call edge function with auth to get the TikTok auth URL
    console.log('[connectTikTok] Calling tiktok-start edge function...');
    const { data, error } = await supabase.functions.invoke('tiktok-start', {
      method: 'GET',
    });

    if (error) {
      console.error('[connectTikTok] Error from edge function:', error);
      // Fallback to direct navigation
      console.log('[connectTikTok] Falling back to direct navigation');
      window.location.href = `${SUPABASE_URL}/functions/v1/tiktok-start`;
      return;
    }

    console.log('[connectTikTok] Edge function response:', data);

    // If we got a redirect URL, navigate to it
    if (data?.redirect_url) {
      console.log('[connectTikTok] Navigating to TikTok auth:', data.redirect_url);
      window.location.href = data.redirect_url;
    } else {
      // Fallback to direct navigation
      console.log('[connectTikTok] No redirect_url in response, using direct navigation');
      window.location.href = `${SUPABASE_URL}/functions/v1/tiktok-start`;
    }
  } catch (err) {
    console.error('[connectTikTok] Exception caught:', err);
    // Fallback to direct navigation
    console.log('[connectTikTok] Exception fallback to direct navigation');
    window.location.href = `${SUPABASE_URL}/functions/v1/tiktok-start`;
  }
}
