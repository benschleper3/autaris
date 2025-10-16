import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { access_token } = await req.json();
    if (!access_token) {
      return new Response(
        JSON.stringify({ error: "Missing access_token" }), 
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    const CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY") ?? Deno.env.get("TIKTOK_CLIENT_ID");
    const CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET");

    console.log('[tiktok-revoke] Revoking token');

    const r = await fetch("https://open.tiktokapis.com/v2/oauth/revoke/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: CLIENT_KEY!,
        client_secret: CLIENT_SECRET!,
        token: access_token,
      }),
    });

    const text = await r.text();
    console.log(`[tiktok-revoke] Response: ${r.status}`);
    
    return new Response(
      text, 
      { 
        status: r.status, 
        headers: { ...corsHeaders, 'content-type': 'application/json' } 
      }
    );
  } catch (e) {
    console.error('[tiktok-revoke] Error:', e);
    return new Response(
      JSON.stringify({ error: String(e) }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' }
      }
    );
  }
});
