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
    const { from, to, platforms, sort = 'views', dir = 'desc', page = 1, pageSize = 20 } = body;

    console.log('[analytics-top-posts] Fetching top posts for user:', user_id, { from, to, platforms, sort, dir, page, pageSize });

    const { data, error } = await supaAdmin.rpc('get_top_posts', {
      p_user_id: user_id,
      p_from: from || null,
      p_to: to || null,
      p_platforms: platforms || null,
      p_sort: sort,
      p_dir: dir,
      p_page: page,
      p_page_size: pageSize
    });

    if (error) {
      console.error('[analytics-top-posts] Query error:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[analytics-top-posts] Found', data?.length ?? 0, 'posts');

    return new Response(JSON.stringify({ rows: data ?? [] }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('[analytics-top-posts] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
