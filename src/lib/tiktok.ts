import { SUPABASE_URL } from '@/integrations/supabase/config';
import { supabase } from '@/integrations/supabase/client';

/**
 * Navigate to TikTok OAuth
 * Calls the edge function first to get the auth URL, then navigates
 */
export async function connectTikTok() {
  console.log('[connectTikTok] Starting TikTok OAuth flow...');
  
  // Navigate directly to the tiktok-start edge function
  // This is simpler and more reliable than using supabase.functions.invoke
  const authUrl = `${SUPABASE_URL}/functions/v1/tiktok-start`;
  console.log('[connectTikTok] Redirecting to:', authUrl);
  
  window.location.href = authUrl;
}
