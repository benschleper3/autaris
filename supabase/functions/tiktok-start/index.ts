import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { buildAuthUrl, getSandboxMode } from '../_shared/tiktok.ts';
import { getUserIdFromRequest } from '../_shared/supabaseAdmin.ts';

const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'https://www.autaris.company';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const isDryrun = url.searchParams.get('dryrun') === '1';

    // If dryrun, return diagnostic info without requiring auth
    if (isDryrun) {
      const CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY') || Deno.env.get('TIKTOK_CLIENT_ID') || '';
      const REDIRECT_URI = Deno.env.get('TIKTOK_REDIRECT_URI') || '';
      const SCOPES = Deno.env.get('TIKTOK_SCOPES') || 'user.info.basic,user.info.stats';
      const sandbox = getSandboxMode();

      // Generate a preview auth URL with dummy state
      const dummyState = btoa(JSON.stringify({ userId: 'preview', timestamp: Date.now(), nonce: crypto.randomUUID() }));
      const authUrlPreview = buildAuthUrl(dummyState);

      return new Response(
        JSON.stringify({
          ok: true,
          client_key: CLIENT_KEY,
          redirect_uri: REDIRECT_URI,
          scopes: SCOPES.split(','),
          sandbox,
          auth_url_preview: authUrlPreview
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the authenticated user's ID from the request
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      // Return error as JSON instead of redirecting
      return new Response(
        JSON.stringify({ error: 'Authentication required' }), 
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate random state and encode with user ID
    const randomState = crypto.randomUUID();
    const stateData = { userId, timestamp: Date.now(), nonce: randomState };
    const state = btoa(JSON.stringify(stateData));
    const authUrl = buildAuthUrl(state);
    
    console.log('[tiktok-start] Generated TikTok auth URL for user:', userId, 'Sandbox:', getSandboxMode());
    
    // Return the auth URL and state as JSON for the client to handle navigation
    // We also set the cookie here for when TikTok redirects back
    return new Response(
      JSON.stringify({ redirect_url: authUrl }), 
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': `tiktok_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        }
      }
    );
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
