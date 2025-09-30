import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supaAdmin } from '../_shared/supabaseAdmin.ts';
import { exchangeCode } from '../_shared/tiktok.ts';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const sandbox = (Deno.env.get('SANDBOX_TIKTOK') ?? 'true').toLowerCase() === 'true';

    let open_id = 'sandbox_open_id';
    let access_token = 'sandbox_access';
    let refresh_token = 'sandbox_refresh';
    let expires_in = 86400*30;

    if (!sandbox) {
      if (!code) {
        return new Response('Missing code parameter', { status: 400 });
      }
      const { data } = await exchangeCode(code);
      open_id = data.open_id;
      access_token = data.access_token;
      refresh_token = data.refresh_token;
      expires_in = data.expires_in;
      console.log('[tiktok-callback] Exchanged code for tokens, open_id:', open_id);
    } else {
      console.log('[tiktok-callback] Sandbox mode - using mock tokens');
    }

    // NOTE: Without state/user context, we can't know which user is connecting during sandbox.
    // For MVP, we allow creating the social account on first sync instead (tiktok-sync).
    const appBase = Deno.env.get('APP_BASE_URL')!;
    return new Response(null, { 
      status: 302, 
      headers: { Location: `${appBase}/dashboard?connected=tiktok` }
    });
  } catch (error) {
    console.error('[tiktok-callback] Error:', error);
    const appBase = Deno.env.get('APP_BASE_URL')!;
    return new Response(null, { 
      status: 302, 
      headers: { Location: `${appBase}/dashboard?error=tiktok_connection_failed` }
    });
  }
});
