import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supaAdmin, getUserIdFromRequest } from '../_shared/supabaseAdmin.ts';

serve(async (req) => {
  try {
    const user_id = await getUserIdFromRequest(req);
    if (!user_id) {
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 50);

    console.log('[analytics-top-posts] Fetching top', limit, 'posts for user:', user_id);

    const { data, error } = await supaAdmin
      .from('v_posts_with_latest')
      .select('post_id,title,platform,published_at,views,engagement_rate,url,likes,comments,shares,saves')
      .eq('user_id', user_id)
      .order('engagement_rate', { ascending: false, nullsFirst: false })
      .order('views', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error('[analytics-top-posts] Query error:', error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[analytics-top-posts] Found', data?.length ?? 0, 'posts');

    return new Response(JSON.stringify({ ok: true, rows: data ?? [] }), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('[analytics-top-posts] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
