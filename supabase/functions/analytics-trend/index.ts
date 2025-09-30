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

    console.log('[analytics-trend] Fetching trends for user:', user_id, { p_from, p_to, p_platform });

    const { data, error } = await supaAdmin.rpc('get_daily_perf', { 
      p_from, 
      p_to, 
      p_platform 
    });

    if (error) {
      console.error('[analytics-trend] RPC error:', error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[analytics-trend] Found', data?.length ?? 0, 'trend rows');

    return new Response(JSON.stringify({ ok: true, rows: data ?? [] }), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('[analytics-trend] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
