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

    console.log('[analytics-heatmap] Fetching heatmap for user:', user_id);

    const { data, error } = await supaAdmin
      .from('v_time_heatmap')
      .select('platform,dow,hour,avg_engagement_percent,posts_count')
      .eq('user_id', user_id);

    if (error) {
      console.error('[analytics-heatmap] Query error:', error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[analytics-heatmap] Found', data?.length ?? 0, 'heatmap rows');

    return new Response(JSON.stringify({ ok: true, rows: data ?? [] }), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('[analytics-heatmap] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
