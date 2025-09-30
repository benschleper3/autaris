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
    const p_from = url.searchParams.get('from');
    const p_to = url.searchParams.get('to');
    const p_platform = url.searchParams.get('platform') ?? 'all';

    console.log('[analytics-kpis] Fetching KPIs for user:', user_id, { p_from, p_to, p_platform });

    const { data, error } = await supaAdmin.rpc('get_ugc_kpis', { 
      p_from, 
      p_to, 
      p_platform 
    });

    if (error) {
      console.error('[analytics-kpis] RPC error:', error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const row = Array.isArray(data) ? data[0] : data;
    const result = row ?? { 
      views_30d: 0, 
      avg_er_30d: 0, 
      posts_30d: 0, 
      active_campaigns: 0 
    };

    console.log('[analytics-kpis] Result:', result);

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[analytics-kpis] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
