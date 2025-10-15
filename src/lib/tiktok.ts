import { supabase } from '@/integrations/supabase/client';

// TikTok OAuth configuration
const TIKTOK_CLIENT_ID = 'aw1i8zw7k4u93q6b'; // Your TikTok client key
const REDIRECT_URI = 'https://www.autaris.company/functions/v1/tiktok-callback';
const SCOPES = 'user.info.basic,user.info.stats';

/**
 * Navigate to TikTok OAuth
 * Constructs the auth URL directly and redirects
 */
export async function connectTikTok() {
  try {
    // Get authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }

    // Generate state with user ID for callback validation
    const randomState = crypto.randomUUID();
    const stateData = { 
      userId: session.user.id, 
      timestamp: Date.now(), 
      nonce: randomState 
    };
    const state = btoa(JSON.stringify(stateData));

    // Store state in sessionStorage for callback validation
    sessionStorage.setItem('tiktok_oauth_state', state);

    // Construct TikTok auth URL
    const redirectUri = encodeURIComponent(REDIRECT_URI);
    const scopes = encodeURIComponent(SCOPES);
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_ID}&scope=${scopes}&response_type=code&redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}`;

    console.log('[tiktok] Redirecting to TikTok OAuth:', authUrl);
    
    // Redirect to TikTok
    window.location.href = authUrl;
  } catch (err) {
    console.error('Error connecting to TikTok:', err);
  }
}
