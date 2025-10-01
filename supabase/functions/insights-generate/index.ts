import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supaAdmin, getUserIdFromRequest } from '../_shared/supabaseAdmin.ts';
import { weeklySummary } from '../_shared/ai.ts';

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
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[insights-generate] Generating insights for user:', user_id);

    const today = new Date(); 
    const from = new Date(today); 
    from.setDate(from.getDate() - 30);
    const fromISO = from.toISOString().slice(0, 10);
    const toISO = today.toISOString().slice(0, 10);

    // Fetch all data in parallel
    const [{ data: trend }, { data: tops }, { data: kpi }] = await Promise.all([
      supaAdmin.rpc('get_daily_perf', { 
        p_from: fromISO, 
        p_to: toISO, 
        p_platform: 'all' 
      }),
      supaAdmin
        .from('v_posts_with_latest')
        .select('title,platform,views,engagement_rate,url')
        .eq('user_id', user_id)
        .order('engagement_rate', { ascending: false })
        .order('views', { ascending: false })
        .limit(10),
      supaAdmin.rpc('get_ugc_kpis', { 
        p_from: fromISO, 
        p_to: toISO, 
        p_platform: 'all' 
      })
    ]);

    const krow = Array.isArray(kpi) ? kpi[0] : (kpi ?? {});
    
    console.log('[insights-generate] Data collected, calling AI');

    const insight = await weeklySummary({
      kpis: { 
        views_30d: krow.views_30d ?? 0, 
        avg_er_30d: krow.avg_er_30d ?? 0, 
        posts_30d: krow.posts_30d ?? 0, 
        active_campaigns: krow.active_campaigns ?? 0 
      },
      topPosts: tops ?? [],
      trend: (trend ?? []).map((r: any) => ({ 
        day: r.day, 
        views: r.day_views, 
        er: r.avg_er_percent 
      })),
    });

    console.log('[insights-generate] AI response received, saving to DB');

    // Calculate week start (Sunday)
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());

    await supaAdmin.from('weekly_insights').insert({
      user_id,
      week_start: weekStart.toISOString().slice(0, 10),
      narrative: insight.narrative ?? '',
      recommendations: insight.recommendations ?? '',
      confidence: insight.confidence ?? 0.8
    });

    console.log('[insights-generate] Insights saved successfully');

    return new Response(JSON.stringify({ ok: true, insight }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('[insights-generate] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
