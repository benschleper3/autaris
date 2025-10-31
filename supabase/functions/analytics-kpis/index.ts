import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supaAdmin, getUserIdFromRequest } from '../_shared/supabaseAdmin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user_id = await getUserIdFromRequest(req);
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { from, to, platforms } = body;
    const p_platform = (platforms && platforms.length > 0) ? platforms[0] : 'all';

    console.log('[analytics-kpis] Fetching KPIs for user:', user_id, { from, to, p_platform });

    const { data, error } = await supaAdmin.rpc('get_ugc_kpis', {
      p_user_id: user_id,
      p_from: from || null,
      p_to: to || null,
      p_platform
    });

    if (error) {
      console.error('[analytics-kpis] RPC error:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[analytics-kpis] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
