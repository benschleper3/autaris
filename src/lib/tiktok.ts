import { supabase } from '@/integrations/supabase/client';

/**
 * Navigate to TikTok OAuth
 * Builds the auth URL client-side and redirects directly to TikTok
 */
export async function connectTikTok() {
  try {
    // Get authenticated user ID for state
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    // Build state with user ID
    const stateData = { userId: user.id, timestamp: Date.now(), nonce: crypto.randomUUID() };
    const state = btoa(JSON.stringify(stateData));

    // Get environment variables
    const clientKey = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
    const redirectUri = import.meta.env.VITE_TIKTOK_REDIRECT_URI;
    const scopes = import.meta.env.VITE_TIKTOK_SCOPES || 'user.info.basic,user.info.stats';

    if (!clientKey) {
      console.error('VITE_TIKTOK_CLIENT_KEY not set in environment');
      alert('TikTok Client Key not configured. Please add VITE_TIKTOK_CLIENT_KEY to your environment variables.');
      return;
    }

    // Build TikTok OAuth URL
    const params = new URLSearchParams({
      client_key: clientKey,
      scope: scopes,
      response_type: 'code',
      redirect_uri: redirectUri,
      state: state,
    });

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    
    console.log('[TikTok] Redirecting to OAuth:', authUrl);
    window.location.href = authUrl;
  } catch (err) {
    console.error('Error connecting to TikTok:', err);
  }
}
