import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supaAdmin, getUserIdFromRequest } from '../_shared/supabaseAdmin.ts';
import { listVideos, getVideoStats, refreshToken } from '../_shared/tiktok.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user_id = await getUserIdFromRequest(req);
    if (!user_id) {
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[tiktok-sync] Starting sync for user:', user_id);

    // Load or create sandbox account
    const { data: acct } = await supaAdmin
      .from('social_accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('platform', 'tiktok')
      .maybeSingle();

    let account = acct;
    if (!account) {
      console.log('[tiktok-sync] Creating new TikTok account for user');
      // Create a placeholder when sandbox is enabled
      const { data: created } = await supaAdmin
        .from('social_accounts')
        .insert({
          user_id, 
          platform: 'tiktok', 
          external_id: 'sandbox_open_id', 
          status: 'active',
          handle: 'creator'
        })
        .select('*')
        .single();
      account = created!;
    }

    // Refresh token if needed (skipped in sandbox)
    const sandbox = (Deno.env.get('SANDBOX_TIKTOK') ?? 'true').toLowerCase() === 'true';
    if (!sandbox && account?.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      try {
        console.log('[tiktok-sync] Refreshing expired token');
        const r = await refreshToken(account.refresh_token);
        const exp = new Date(Date.now() + r.data.expires_in * 1000).toISOString();
        await supaAdmin
          .from('social_accounts')
          .update({
            access_token: r.data.access_token, 
            refresh_token: r.data.refresh_token, 
            token_expires_at: exp
          })
          .eq('id', account.id);
        account.access_token = r.data.access_token;
      } catch (err) {
        console.error('[tiktok-sync] Token refresh failed:', err);
      }
    }

    const since = new Date(); 
    since.setDate(since.getDate() - 90);
    const videos = await listVideos(
      account.access_token ?? 'sandbox', 
      account.external_id, 
      since.toISOString(), 
      user_id
    );

    console.log('[tiktok-sync] Found', videos.length, 'videos');

    let postsUpserted = 0, metricSnapshots = 0;
    for (const v of videos) {
      const videoUrl = v.url ?? `https://www.tiktok.com/@creator/video/${v.id}`;
      
      // Check if post exists
      const { data: existingPost } = await supaAdmin
        .from('posts')
        .select('id')
        .eq('user_id', user_id)
        .eq('asset_url', videoUrl)
        .maybeSingle();

      let postId = existingPost?.id;

      if (!postId) {
        // Create new post
        const { data: newPost, error: insertErr } = await supaAdmin
          .from('posts')
          .insert({
            user_id,
            social_account_id: account.id,
            title: v.title ?? null,
            caption: v.desc ?? null,
            asset_url: videoUrl,
            published_at: v.create_time ? new Date(v.create_time).toISOString() : null,
          })
          .select('id')
          .single();

        if (insertErr || !newPost) {
          console.error('[tiktok-sync] Failed to insert post:', insertErr);
          continue;
        }
        postId = newPost.id;
      }

      postsUpserted++;

      // Get stats and insert metrics
      const stats = await getVideoStats(
        account.access_token ?? 'sandbox', 
        v.id, 
        user_id
      );
      
      await supaAdmin.from('post_metrics').insert({
        post_id: postId,
        captured_at: new Date().toISOString(),
        views: stats.views ?? 0,
        likes: stats.likes ?? 0,
        comments: stats.comments ?? 0,
        shares: stats.shares ?? 0,
        saves: stats.saves ?? 0,
      });
      metricSnapshots++;
    }

    // Update last synced
    await supaAdmin
      .from('social_accounts')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', account.id);

    console.log('[tiktok-sync] Sync complete:', { posts: postsUpserted, metrics: metricSnapshots });

    return new Response(
      JSON.stringify({ 
        ok: true, 
        synced: { posts: postsUpserted, metrics: metricSnapshots } 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[tiktok-sync] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
