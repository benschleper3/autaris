import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { buildAuthUrl } from '../_shared/tiktok.ts';
import { getUserIdFromRequest } from '../_shared/supabaseAdmin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.autaris.company',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authenticated user's ID from the request
    // This works even without JWT verification because the user's session cookie is sent
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      // Redirect to login page if not authenticated
      return new Response(null, {
        status: 302,
        headers: {
          'Location': 'https://www.autaris.company/auth?error=login_required'
        }
      });
    }

    // Check for dryrun mode
    const url = new URL(req.url);
    const isDryrun = url.searchParams.get('dryrun') === '1';

    // Generate random state and encode with user ID
    const randomState = crypto.randomUUID();
    const stateData = { userId, timestamp: Date.now(), nonce: randomState };
    const state = btoa(JSON.stringify(stateData));
    const authUrl = buildAuthUrl(state);
    
    // If dryrun mode, return diagnostic info instead of redirecting
    if (isDryrun) {
      const clientKey = Deno.env.get('TIKTOK_CLIENT_ID') || '';
      const redirectUri = Deno.env.get('TIKTOK_REDIRECT_URI') || '';
      const scopes = ['user.info.basic', 'user.info.stats'];
      
      return new Response(
        JSON.stringify({ 
          ok: true,
          mode: 'dryrun',
          client_key: clientKey,
          scopes,
          redirect_uri: redirectUri,
          auth_url_preview: authUrl
        }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('[tiktok-start] Generated TikTok auth URL for user:', userId);
    
    // Set secure state cookie and redirect
    const headers = new Headers({
      'Location': authUrl,
      'Set-Cookie': `tiktok_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    });
    
    return new Response(null, { 
      status: 302,
      headers
    });
  } catch (error) {
    console.error('[tiktok-start] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate TikTok auth URL' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
