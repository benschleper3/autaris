import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { buildAuthUrl, getSandboxMode } from '../_shared/tiktok.ts';
import { getUserIdFromRequest } from '../_shared/supabaseAdmin.ts';

const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'https://www.autaris.company';

const corsHeaders = {
  'Access-Control-Allow-Origin': APP_BASE_URL,
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
      const scopesStr = Deno.env.get('TIKTOK_SCOPES') || 'user.info.basic,user.info.stats';
      const scopes = scopesStr.split(',').map(s => s.trim());
      const sandbox = getSandboxMode();
      
      // Mask client key for security
      const maskedClientKey = clientKey.length > 8 
        ? clientKey.slice(0, 3) + '•'.repeat(clientKey.length - 6) + clientKey.slice(-3)
        : clientKey;
      
      return new Response(
        JSON.stringify({ 
          ok: true,
          mode: 'dryrun',
          sandbox,
          client_key: maskedClientKey,
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
    
    console.log('[tiktok-start] Generated TikTok auth URL for user:', userId, 'Sandbox:', getSandboxMode());
    
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
