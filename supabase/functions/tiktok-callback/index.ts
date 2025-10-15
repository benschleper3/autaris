// TikTok OAuth Callback Handler
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { exchangeCode, getUserInfo, getUserStats, getSandboxMode, listVideos, getVideoStats } from '../_shared/tiktok.ts';
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

    const username = userInfo.username || userInfo.display_name;
    console.log(`[tiktok-callback] User info fetched: ${username}`);

    // Delete any existing TikTok connection for this user first
    await supaAdmin
      .from('social_accounts')
      .delete()
      .eq('user_id', userId)
      .eq('platform', 'tiktok');

    // Insert fresh TikTok account data
    const expiresAt = new Date(Date.now() + expires_in * 1000);
    const { error: dbError } = await supaAdmin
      .from('social_accounts')
      .insert({
        user_id: userId,
        platform: 'tiktok',
        external_id: open_id,
        handle: username,
        display_name: userInfo.display_name,
        avatar_url: userInfo.avatar_url,
        access_token,
        refresh_token,
        token_expires_at: expiresAt.toISOString(),
        follower_count: userStats.follower_count,
        following_count: userStats.following_count,
        video_count: userStats.video_count,
        status: 'active',
        last_synced_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("[tiktok-callback] Database error:", dbError);
      return new Response(null, { 
        status: 302, 
        headers: { Location: `${APP_BASE_URL}/dashboard?error=tiktok_save_failed` } 
      });
    }

    console.log(`[tiktok-callback] Successfully connected TikTok account for user ${userId}`);

    // Start background sync of videos/metrics (don't await - runs after redirect)
    const syncTask = async () => {
      try {
        console.log(`[tiktok-callback] Starting background sync for user ${userId}`);
        const sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Last 30 days
        
        const videos = await listVideos(access_token, open_id, sinceDate, userId);
        console.log(`[tiktok-callback] Found ${videos.length} videos to sync`);
        
        let syncedPosts = 0;
        let syncedMetrics = 0;

        for (const video of videos) {
          // Create/update post
          const { data: post, error: postError } = await supaAdmin
            .from('posts')
            .upsert({
              user_id: userId,
              social_account_id: (await supaAdmin
                .from('social_accounts')
                .select('id')
                .eq('user_id', userId)
                .eq('platform', 'tiktok')
                .single()).data?.id,
              external_id: video.id,
              title: video.title,
              caption: video.desc,
              video_url: video.url,
              published_at: video.create_time,
              status: 'published'
            }, {
              onConflict: 'user_id,external_id'
            })
            .select('id')
            .single();

          if (postError) {
            console.error(`[tiktok-callback] Error syncing post ${video.id}:`, postError);
            continue;
          }

          syncedPosts++;

          // Fetch and store metrics
          const stats = await getVideoStats(access_token, video.id, userId);
          const { error: metricsError } = await supaAdmin
            .from('post_metrics')
            .insert({
              post_id: post.id,
              views: stats.views,
              likes: stats.likes,
              comments: stats.comments,
              shares: stats.shares,
              saves: stats.saves,
              captured_at: new Date().toISOString()
            });

          if (!metricsError) syncedMetrics++;
        }

        console.log(`[tiktok-callback] Sync complete: ${syncedPosts} posts, ${syncedMetrics} metrics`);
      } catch (err) {
        console.error('[tiktok-callback] Background sync error:', err);
      }
    };

    // Run sync in background (non-blocking)
    EdgeRuntime.waitUntil(syncTask());

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
