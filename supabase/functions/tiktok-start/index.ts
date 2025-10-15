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
