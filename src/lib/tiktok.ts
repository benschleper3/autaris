import { SUPABASE_URL } from '@/integrations/supabase/config';
import { supabase } from '@/integrations/supabase/client';

/**
 * Navigate to TikTok OAuth
 * Calls the edge function first to get the auth URL, then navigates
 */
/**
 * Navigate to TikTok OAuth
 * Calls the edge function first to get the auth URL, then navigates
 */
export async function connectTikTok() {
  try {
    // Call edge function with auth to get the TikTok auth URL
    const { data, error } = await supabase.functions.invoke('tiktok-start', {
      method: 'GET',
    });

    if (error) {
      console.error('Error getting TikTok auth URL:', error);
      // Fallback to direct navigation
      window.location.href = `${SUPABASE_URL}/functions/v1/tiktok-start`;
      return;
    }

    // If we got a redirect URL, navigate to it
    if (data?.redirect_url) {
      window.location.href = data.redirect_url;
    } else {
      // Fallback to direct navigation
      window.location.href = `${SUPABASE_URL}/functions/v1/tiktok-start`;
    }
  } catch (err) {
    console.error('Error connecting to TikTok:', err);
    // Fallback to direct navigation
    window.location.href = `${SUPABASE_URL}/functions/v1/tiktok-start`;
  }
}
