import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supaAdmin, getUserIdFromRequest } from '../_shared/supabaseAdmin.ts';

const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'https://www.autaris.company';
const SANDBOX = Deno.env.get('SANDBOX_TIKTOK') === 'true';
const CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_ID')!;
const CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET')!;
const REDIRECT_URI = Deno.env.get('TIKTOK_REDIRECT_URI')!;

const tokenUrl = SANDBOX
  ? 'https://open-sandbox.tiktok.com/oauth/access_token/'
  : 'https://open.tiktokapis.com/v2/oauth/token/';
const userInfoUrl = SANDBOX
  ? 'https://open-sandbox.tiktok.com/api/user/info/'
  : 'https://open.tiktokapis.com/v2/user/info/';
const userStatsUrl = SANDBOX
  ? 'https://open-sandbox.tiktok.com/api/user/stats/'
  : 'https://open.tiktokapis.com/v2/user/stats/';

const corsHeaders = {
  'Access-Control-Allow-Origin': APP_BASE_URL,
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const isDryrun = url.searchParams.get('dryrun') === '1';
    
    // Dryrun mode
    if (isDryrun) {
      return new Response(
        JSON.stringify({ 
          ok: true, 
          mode: 'dryrun',
          sandbox: SANDBOX,
          message: 'Callback reachable' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const code = url.searchParams.get('code');
    const stateParam = url.searchParams.get('state');

    // Verify state parameter against cookie
    let userId: string;
    try {
      if (!stateParam) throw new Error('Missing state parameter');
      
      const cookies = req.headers.get('cookie') || '';
      const cookieState = cookies.split(';')
        .find(c => c.trim().startsWith('tiktok_oauth_state='))
        ?.split('=')[1];
      
      if (!cookieState || cookieState !== stateParam) {
        throw new Error('State mismatch - possible CSRF attempt');
      }
      
      const decoded = JSON.parse(atob(stateParam));
      userId = decoded.userId;
      if (!userId) throw new Error('Invalid state: missing userId');
      console.log('[tiktok-callback] Retrieved user ID from state:', userId);
    } catch (e) {
      console.error('[tiktok-callback] State verification failed:', e);
      return new Response(null, { 
        status: 302, 
        headers: { Location: `${APP_BASE_URL}/landing?error=state_mismatch` }
      });
    }

    if (!code) {
      console.error('[tiktok-callback] Missing code parameter');
      return new Response(null, { 
        status: 302, 
        headers: { Location: `${APP_BASE_URL}/landing?error=no_code` }
      });
    }

    // Exchange code for token
    let accessToken: string;
    let openId: string;
    
    try {
      const tokenBody = new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      });

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenBody.toString(),
      });

      const tokenData = await tokenResponse.json();
      console.log('[tiktok-callback] Token exchange response:', tokenData);

      if (!tokenResponse.ok || tokenData.error) {
        throw new Error(tokenData.error?.message || 'Token exchange failed');
      }

      accessToken = tokenData.data?.access_token || tokenData.access_token;
      openId = tokenData.data?.open_id || tokenData.open_id;

      if (!accessToken || !openId) {
        throw new Error('Missing access_token or open_id in response');
      }
    } catch (e) {
      console.error('[tiktok-callback] Token exchange error:', e);
      return new Response(null, { 
        status: 302, 
        headers: { Location: `${APP_BASE_URL}/landing?error=token_exchange` }
      });
    }

    // Fetch user info
    let displayName = 'TikTok User';
    let avatarUrl = '';
    
    try {
      const userInfoResponse = await fetch(`${userInfoUrl}?access_token=${accessToken}&open_id=${openId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const userInfoData = await userInfoResponse.json();
      console.log('[tiktok-callback] User info response:', userInfoData);
      
      displayName = userInfoData.data?.user?.display_name || displayName;
      avatarUrl = userInfoData.data?.user?.avatar_url || '';
    } catch (e) {
      console.error('[tiktok-callback] User info fetch failed:', e);
    }

    // Fetch user stats
    let followerCount = 0;
    let likesCount = 0;
    let videoCount = 0;
    
    try {
      const statsResponse = await fetch(`${userStatsUrl}?access_token=${accessToken}&open_id=${openId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const statsData = await statsResponse.json();
      console.log('[tiktok-callback] User stats response:', statsData);
      
      followerCount = statsData.data?.follower_count || 0;
      likesCount = statsData.data?.likes_count || 0;
      videoCount = statsData.data?.video_count || 0;
    } catch (e) {
      console.error('[tiktok-callback] User stats fetch failed:', e);
    }

    // Upsert to social_accounts
    const { error: upsertError } = await supaAdmin
      .from('social_accounts')
      .upsert({
        user_id: userId,
        platform: 'tiktok',
        external_id: openId,
        handle: displayName,
        avatar_url: avatarUrl,
        follower_count: followerCount,
        likes_count: likesCount,
        video_count: videoCount,
        last_synced_at: new Date().toISOString(),
        status: 'active',
      }, { 
        onConflict: 'user_id,platform',
      });

    if (upsertError) {
      console.error('[tiktok-callback] Error storing social account:', upsertError);
      throw upsertError;
    }

    console.log('[tiktok-callback] Successfully connected TikTok for user:', userId);
    
    // Clear state cookie and redirect to dashboard
    const headers = new Headers({
      'Location': `${APP_BASE_URL}/dashboard?connected=tiktok`,
      'Set-Cookie': 'tiktok_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    });
    
    return new Response(null, { 
      status: 302, 
      headers
    });
  } catch (error) {
    console.error('[tiktok-callback] Unhandled error:', error);
    
    const headers = new Headers({
      'Location': `${APP_BASE_URL}/landing?error=tiktok_oauth`,
      'Set-Cookie': 'tiktok_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    });
    
    return new Response(null, { 
      status: 302, 
      headers
    });
  }
});
