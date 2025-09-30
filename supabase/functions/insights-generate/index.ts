import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { weeklySummary } from '../_shared/ai.ts';

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

    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 30);
    const fromISO = from.toISOString().slice(0, 10);
    const toISO = today.toISOString().slice(0, 10);

    // Fetch KPIs, trend, and top posts in parallel
    const [kpiResult, trendResult, topsResult] = await Promise.all([
      supaAdmin.rpc('get_ugc_kpis', { 
        p_from: fromISO, 
        p_to: toISO, 
        p_platform: 'all' 
      }),
      supaAdmin.rpc('get_daily_perf', { 
        p_from: fromISO, 
        p_to: toISO, 
        p_platform: 'all' 
      }),
      supaAdmin
        .from('v_posts_with_latest')
        .select('title,platform,views,engagement_rate,url')
        .eq('user_id', user.id)
        .order('engagement_rate', { ascending: false })
        .order('views', { ascending: false })
        .limit(10),
    ]);

    const kpi = Array.isArray(kpiResult.data) && kpiResult.data.length > 0 
      ? kpiResult.data[0] 
      : kpiResult.data;

    const trend = (trendResult.data ?? []).map((r: any) => ({
      day: r.day,
      views: r.day_views,
      er: r.avg_er_percent,
    }));

    const topPosts = topsResult.data ?? [];

    // Generate AI insights
    const insight = await weeklySummary({
      kpis: {
        views_30d: kpi?.views_30d ?? 0,
        avg_er_30d: kpi?.avg_er_30d ?? 0,
        posts_30d: kpi?.posts_30d ?? 0,
        active_campaigns: kpi?.active_campaigns ?? 0,
      },
      topPosts,
      trend,
    });

    // Calculate week start (Sunday)
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    
    // Insert into weekly_insights
    await supaAdmin.from('weekly_insights').insert({
      user_id: user.id,
      week_start: weekStart.toISOString().slice(0, 10),
      narrative: insight.narrative ?? '',
      recommendations: insight.recommendations ?? '',
      confidence: insight.confidence ?? 0.8,
    });

    return new Response(
      JSON.stringify({ ok: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[insights-generate] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
