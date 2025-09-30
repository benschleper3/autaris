import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';

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

    const url = new URL(req.url);
    const p_from = url.searchParams.get('from');
    const p_to = url.searchParams.get('to');
    const p_platform = url.searchParams.get('platform') || 'all';

    const supaAdmin = getSupabaseAdmin();

    // Call the existing SQL function
    const { data, error } = await supaAdmin.rpc('get_ugc_kpis', {
      p_from,
      p_to,
      p_platform,
    });

    if (error) {
      console.error('[analytics-kpis] Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // The function returns a single row with columns
    const result = Array.isArray(data) && data.length > 0 ? data[0] : data;

    return new Response(
      JSON.stringify({
        ok: true,
        views_30d: result?.views_30d ?? 0,
        avg_er_30d: result?.avg_er_30d ?? 0,
        posts_30d: result?.posts_30d ?? 0,
        active_campaigns: result?.active_campaigns ?? 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[analytics-kpis] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
