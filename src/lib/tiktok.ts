import { SUPABASE_URL } from '@/integrations/supabase/config';
import { supabase } from '@/integrations/supabase/client';

/**
 * Navigate to TikTok OAuth
 * Calls the edge function first to get the auth URL, then navigates
 */
export async function connectTikTok() {
  console.log('[connectTikTok] Starting TikTok OAuth flow...');
  
  try {
    // Use the Supabase client to invoke the function - this automatically includes auth
    const { data, error } = await supabase.functions.invoke('tiktok-start');
    
    if (error) {
      console.error('[connectTikTok] Error from tiktok-start:', error);
      throw error;
    }
    
    console.log('[connectTikTok] Got response:', data);
    
    // The function returns a redirect_url - navigate to it
    if (data?.redirect_url) {
      console.log('[connectTikTok] Redirecting to TikTok auth:', data.redirect_url);
      window.location.href = data.redirect_url;
    } else {
      console.error('[connectTikTok] No redirect_url in response:', data);
      throw new Error('No redirect URL returned from tiktok-start');
    }
  } catch (err) {
    console.error('[connectTikTok] Failed to start TikTok OAuth:', err);
    throw err;
  }
}
