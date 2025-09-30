import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { exchangeCode } from '../_shared/tiktok.ts';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      return new Response('Missing code or state', { status: 400 });
    }

    const supaAdmin = getSupabaseAdmin();

    // Retrieve state from healthchecks
    const { data: stateRecords } = await supaAdmin
      .from('healthchecks')
      .select('note')
      .order('created_at', { ascending: false })
      .limit(100);

    let user_id: string | null = null;
    for (const record of stateRecords || []) {
      try {
        const parsed = JSON.parse(record.note);
        if (parsed.type === 'tiktok_state' && parsed.state === state) {
          if (parsed.expires > Date.now()) {
            user_id = parsed.user_id;
            break;
          }
        }
      } catch {}
    }

    if (!user_id) {
      return new Response('Invalid or expired state', { status: 400 });
    }

    // Exchange code for tokens
    const { data } = await exchangeCode(code);
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

    // Upsert social account
    const { error } = await supaAdmin.from('social_accounts').upsert({
      user_id,
      platform: 'tiktok',
      external_id: data.open_id,
      handle: data.open_id,
      status: 'active',
      last_synced_at: null,
    }, { onConflict: 'user_id,platform,handle' });

    if (error) {
      console.error('[tiktok-callback] Error saving account:', error);
      return new Response('Failed to save account', { status: 500 });
    }

    // Redirect back to dashboard
    const appBaseUrl = Deno.env.get('APP_BASE_URL')!;
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${appBaseUrl}/dashboard?connected=tiktok`,
      },
    });
  } catch (error) {
    console.error('[tiktok-callback] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Error: ${message}`, { status: 500 });
  }
});
