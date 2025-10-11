import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { buildAuthUrl } from '../_shared/tiktok.ts';
import { getUserIdFromRequest } from '../_shared/supabaseAdmin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authenticated user's ID
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }), 
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for dryrun mode
    const url = new URL(req.url);
    const isDryrun = url.searchParams.get('dryrun') === '1';

    // Encode user ID in state parameter so we can retrieve it in callback
    const state = btoa(JSON.stringify({ userId, timestamp: Date.now() }));
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
    
    // Return the URL as JSON so the frontend can redirect
    return new Response(
      JSON.stringify({ url: authUrl }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
