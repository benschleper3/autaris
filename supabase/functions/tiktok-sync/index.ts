import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supaAdmin, getUserIdFromRequest } from '../_shared/supabaseAdmin.ts';

const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'https://www.autaris.company';
const SANDBOX = Deno.env.get('SANDBOX_TIKTOK') === 'true';

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
    // Parse body
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Empty body is fine
    }

    const isDryrun = body.dryrun === true;

    // Dryrun mode
    if (isDryrun) {
      return new Response(
        JSON.stringify({
          ok: true,
          sandbox: SANDBOX,
          follower_count: 1245,
          likes_count: 31877,
          video_count: 61,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get current user
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'no_session' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Find user's TikTok account
    const { data: account, error: accountError } = await supaAdmin
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'tiktok')
      .single();

    if (accountError || !account) {
      console.error('[tiktok-sync] No TikTok account found for user:', userId);
      return new Response(
        JSON.stringify({ ok: false, error: 'no_account' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!account.access_token || !account.external_id) {
      console.error('[tiktok-sync] Missing tokens for user:', userId);
      return new Response(
        JSON.stringify({ ok: false, error: 'no_tokens' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch fresh stats from TikTok
    let followerCount = 0;
    let likesCount = 0;
    let videoCount = 0;

    try {
      const statsResponse = await fetch(
        `${userStatsUrl}?access_token=${account.access_token}&open_id=${account.external_id}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const statsData = await statsResponse.json();
      console.log('[tiktok-sync] User stats response:', statsData);

      followerCount = statsData.data?.follower_count || 0;
      likesCount = statsData.data?.likes_count || 0;
      videoCount = statsData.data?.video_count || 0;
    } catch (e) {
      console.error('[tiktok-sync] Failed to fetch stats:', e);
      return new Response(
        JSON.stringify({ ok: false, error: 'stats_fetch_failed' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update the account with fresh stats
    const { error: updateError } = await supaAdmin
      .from('social_accounts')
      .update({
        follower_count: followerCount,
        likes_count: likesCount,
        video_count: videoCount,
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    if (updateError) {
      console.error('[tiktok-sync] Failed to update account:', updateError);
      return new Response(
        JSON.stringify({ ok: false, error: 'update_failed' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[tiktok-sync] Successfully synced stats for user:', userId);

    return new Response(
      JSON.stringify({ ok: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[tiktok-sync] Unhandled error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'internal_error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
