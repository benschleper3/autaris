import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { refreshToken, listVideos, getVideoStats } from '../_shared/tiktok.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supaAdmin = getSupabaseAdmin();

    // Load account
    const { data: acct, error: acctErr } = await supaAdmin
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .eq('status', 'active')
      .maybeSingle();

    if (acctErr || !acct) {
      return new Response(JSON.stringify({ error: 'no_tiktok_account' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch videos (last 90 days)
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const videos = await listVideos('', acct.external_id, since.toISOString());

    let postsUpserted = 0;
    let metricSnapshots = 0;

    for (const v of videos) {
      const videoUrl = v.url ?? `https://www.tiktok.com/@x/video/${v.id}`;
      
      // Upsert post
      const { data: postRow, error: postErr } = await supaAdmin
        .from('posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('asset_url', videoUrl)
        .maybeSingle();

      let postId = postRow?.id;

      if (!postId) {
        const { data: newPost, error: insertErr } = await supaAdmin
          .from('posts')
          .insert({
            user_id: user.id,
            social_account_id: acct.id,
            title: v.title ?? null,
            caption: v.desc ?? null,
            asset_url: videoUrl,
            published_at: v.create_time ? new Date(v.create_time).toISOString() : null,
          })
          .select('id')
          .single();

        if (insertErr || !newPost) continue;
        postId = newPost.id;
      }

      postsUpserted++;

      // Get stats and insert metrics
      const stats = await getVideoStats('', v.id);
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
      .eq('id', acct.id);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        synced: { posts: postsUpserted, metrics: metricSnapshots } 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[tiktok-sync] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
