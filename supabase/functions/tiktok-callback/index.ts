import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supaAdmin, getUserIdFromRequest } from '../_shared/supabaseAdmin.ts';
import { exchangeCode, getUserInfo, getUserStats } from '../_shared/tiktok.ts';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const isDryrun = url.searchParams.get('dryrun') === '1';
    
    // If dryrun mode, just confirm endpoint is reachable
    if (isDryrun) {
      return new Response(
        JSON.stringify({ 
          ok: true, 
          mode: 'dryrun', 
          message: 'Callback reachable' 
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const code = url.searchParams.get('code');
    const stateParam = url.searchParams.get('state');
    const sandbox = (Deno.env.get('SANDBOX_TIKTOK') ?? 'true').toLowerCase() === 'true';
    const appBase = Deno.env.get('APP_BASE_URL') || 'http://localhost:8080';

    // Decode user ID from state parameter
    let userId: string;
    try {
      if (!stateParam) throw new Error('Missing state parameter');
      const decoded = JSON.parse(atob(stateParam));
      userId = decoded.userId;
      if (!userId) throw new Error('Invalid state: missing userId');
      console.log('[tiktok-callback] Retrieved user ID from state:', userId);
    } catch (e) {
      console.error('[tiktok-callback] Failed to decode state:', e);
      return new Response(null, { 
        status: 302, 
        headers: { Location: `${appBase}/dashboard?error=invalid_state` }
      });
    }

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

    // Fetch user info and stats
    const userInfo = await getUserInfo(access_token, open_id, userId);
    const userStats = await getUserStats(access_token, open_id, userId);

    console.log('[tiktok-callback] User info:', userInfo);
    console.log('[tiktok-callback] User stats:', userStats);

    // Store/update social account with profile info
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();
    const { error: upsertError } = await supaAdmin
      .from('social_accounts')
      .upsert({
        user_id: userId,
        platform: 'tiktok',
        external_id: open_id,
        access_token,
        refresh_token,
        token_expires_at: expiresAt,
        display_name: userInfo.display_name,
        avatar_url: userInfo.avatar_url,
        follower_count: userStats.follower_count,
        following_count: userStats.following_count,
        like_count: userStats.likes_count,
        video_count: userStats.video_count,
        status: 'active',
        last_synced_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id,platform',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('[tiktok-callback] Error storing social account:', upsertError);
      throw upsertError;
    }

    console.log('[tiktok-callback] Successfully connected TikTok account for user:', userId);
    const appBase = Deno.env.get('APP_BASE_URL') || 'http://localhost:8080';
    return new Response(null, { 
      status: 302, 
      headers: { Location: `${appBase}/dashboard?connected=tiktok` }
    });
  } catch (error) {
    console.error('[tiktok-callback] Error:', error);
    const appBase = Deno.env.get('APP_BASE_URL') || 'http://localhost:8080';
    return new Response(null, { 
      status: 302, 
      headers: { Location: `${appBase}/dashboard?error=tiktok_connection_failed` }
    });
  }
});
