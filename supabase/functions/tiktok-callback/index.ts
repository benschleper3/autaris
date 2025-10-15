// TikTok OAuth Callback Handler
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { exchangeCode, getUserInfo, getUserStats, getSandboxMode } from '../_shared/tiktok.ts';
import { supaAdmin } from '../_shared/supabaseAdmin.ts';

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function mask(val?: string) {
  if (!val) return "";
  return val.length <= 6 ? "****" : `${val.slice(0,3)}•••${val.slice(-3)} (${val.length})`;
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const origin = req.headers.get("origin") || Deno.env.get("APP_BASE_URL") || "*";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const APP_BASE_URL = Deno.env.get("APP_BASE_URL") ?? "";
  const sandbox = getSandboxMode();
  const redirectUri = Deno.env.get("TIKTOK_REDIRECT_URI") ?? "";
  const clientKey = Deno.env.get("TIKTOK_CLIENT_ID") ?? "";
  const dryrun = url.searchParams.get("dryrun") === "1";

  try {
    if (dryrun) {
      return new Response(JSON.stringify({
        ok: true,
        mode: "dryrun",
        sandbox,
        redirect_uri: redirectUri,
        client_key: mask(clientKey),
        message: "Callback reachable"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Extract OAuth parameters
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      console.error("[tiktok-callback] OAuth error:", error);
      return new Response(null, { 
        status: 302, 
        headers: { Location: `${APP_BASE_URL}/dashboard?error=tiktok_denied` } 
      });
    }

    if (!code || !state) {
      console.error("[tiktok-callback] Missing code or state");
      return new Response(null, { 
        status: 302, 
        headers: { Location: `${APP_BASE_URL}/dashboard?error=tiktok_invalid` } 
      });
    }

    // Decode state to get user ID (skip cookie validation for sandbox/testing)
    let userId: string;
    try {
      const stateData = JSON.parse(atob(state));
      userId = stateData.userId;
      if (!userId) throw new Error("No userId in state");
    } catch (e) {
      console.error("[tiktok-callback] Invalid state data:", e);
      return new Response(null, { 
        status: 302, 
        headers: { Location: `${APP_BASE_URL}/dashboard?error=tiktok_invalid_state` } 
      });
    }

    console.log(`[tiktok-callback] Processing OAuth for user ${userId}, sandbox=${sandbox}`);

    // Exchange code for tokens
    const tokenData = await exchangeCode(code);
    const { access_token, refresh_token, expires_in, open_id } = tokenData.data;

    console.log(`[tiktok-callback] Token exchange successful, open_id=${open_id}`);

    // Fetch user info and stats
    const [userInfo, userStats] = await Promise.all([
      getUserInfo(access_token, open_id, userId),
      getUserStats(access_token, open_id, userId),
    ]);

    console.log(`[tiktok-callback] User info fetched: ${userInfo.display_name}`);

    // Store in social_accounts table
    const expiresAt = new Date(Date.now() + expires_in * 1000);
    const { error: dbError } = await supaAdmin
      .from('social_accounts')
      .upsert({
        user_id: userId,
        platform: 'tiktok',
        external_id: open_id,
        handle: userInfo.display_name,
        display_name: userInfo.display_name,
        avatar_url: userInfo.avatar_url,
        access_token,
        refresh_token,
        token_expires_at: expiresAt.toISOString(),
        follower_count: userStats.follower_count,
        following_count: userStats.following_count,
        like_count: userStats.likes_count,
        video_count: userStats.video_count,
        status: 'active',
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      });

    if (dbError) {
      console.error("[tiktok-callback] Database error:", dbError);
      return new Response(null, { 
        status: 302, 
        headers: { Location: `${APP_BASE_URL}/dashboard?error=tiktok_save_failed` } 
      });
    }

    console.log(`[tiktok-callback] Successfully connected TikTok account for user ${userId}`);

    // Clear the state cookie and redirect to dashboard
    return new Response(null, { 
      status: 302, 
      headers: { 
        Location: `${APP_BASE_URL}/dashboard?connected=tiktok`,
        'Set-Cookie': 'tiktok_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
      } 
    });

  } catch (err) {
    console.error("[tiktok-callback] Unexpected error:", err);
    return new Response(null, { 
      status: 302, 
      headers: { Location: `${APP_BASE_URL}/dashboard?error=tiktok_oauth` } 
    });
  }
});
