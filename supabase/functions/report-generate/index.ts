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

    const body = await req.json();
    const from = body.from ?? null;
    const to = body.to ?? null;
    const campaign_id = body.campaign_id ?? null;

    const supaAdmin = getSupabaseAdmin();

    // Fetch KPIs and top posts
    const [kpiResult, topsResult] = await Promise.all([
      supaAdmin.rpc('get_ugc_kpis', {
        p_from: from,
        p_to: to,
        p_platform: 'all',
      }),
      supaAdmin
        .from('v_posts_with_latest')
        .select('title,platform,views,engagement_rate,url')
        .eq('user_id', user.id)
        .order('engagement_rate', { ascending: false })
        .order('views', { ascending: false })
        .limit(5),
    ]);

    const kpis = Array.isArray(kpiResult.data) && kpiResult.data.length > 0
      ? kpiResult.data[0]
      : kpiResult.data;

    const tops = topsResult.data ?? [];

    // Generate HTML report
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Growth OS Report</title>
  <style>
    body {
      font-family: Inter, system-ui, sans-serif;
      padding: 24px;
      background: #0c0c10;
      color: #e6e6f2;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 { font-size: 28px; margin: 0 0 12px; }
    h2 { font-size: 20px; margin: 24px 0 12px; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; margin: 24px 0; }
    .card {
      background: #12121a;
      border: 1px solid #1f2030;
      border-radius: 12px;
      padding: 16px;
      min-width: 200px;
      flex: 1;
    }
    .card strong { font-size: 24px; display: block; margin-top: 8px; }
    .post-card { margin-bottom: 12px; }
  </style>
</head>
<body>
  <h1>Growth OS — Performance Report</h1>
  <p>Period: ${from ?? '—'} → ${to ?? '—'}${campaign_id ? ` (Campaign: ${campaign_id})` : ''}</p>
  
  <div class="row">
    <div class="card">
      <div>Views (30d)</div>
      <strong>${kpis?.views_30d ?? '—'}</strong>
    </div>
    <div class="card">
      <div>Avg ER%</div>
      <strong>${kpis?.avg_er_30d ?? '—'}%</strong>
    </div>
    <div class="card">
      <div>Posts</div>
      <strong>${kpis?.posts_30d ?? '—'}</strong>
    </div>
    <div class="card">
      <div>Active Campaigns</div>
      <strong>${kpis?.active_campaigns ?? '—'}</strong>
    </div>
  </div>

  <h2>Top Performing Posts</h2>
  ${tops.map((x: any) => `
    <div class="card post-card">
      <strong>${x.title ?? '(untitled)'}</strong>
      <div>${x.platform} — ER ${x.engagement_rate}% — ${x.views} views</div>
    </div>
  `).join('')}
</body>
</html>`;

    const url = `data:text/html;base64,${btoa(html)}`;

    return new Response(
      JSON.stringify({ ok: true, report_url: url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[report-generate] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
