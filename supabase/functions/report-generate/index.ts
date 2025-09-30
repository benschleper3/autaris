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

    const body = await req.json().catch(() => ({}));
    const from = body.from ?? null;
    const to = body.to ?? null;
    const campaign_id = body.campaign_id ?? null;

    console.log('[report-generate] Generating report for user:', user_id, { from, to, campaign_id });

    // Fetch KPIs
    const { data: kpi } = await supaAdmin.rpc('get_ugc_kpis', { 
      p_from: from, 
      p_to: to, 
      p_platform: 'all' 
    });
    const krow = Array.isArray(kpi) ? kpi[0] : (kpi ?? {});

    // Fetch top posts
    const { data: tops } = await supaAdmin
      .from('v_posts_with_latest')
      .select('title,platform,views,engagement_rate,url,likes,comments,shares,saves')
      .eq('user_id', user_id)
      .order('engagement_rate', { ascending: false })
      .order('views', { ascending: false })
      .limit(5);

    // Generate HTML report
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Growth OS Report</title>
  <style>
    body {
      font-family: Inter, system-ui, -apple-system, sans-serif;
      padding: 32px;
      background: #0c0c10;
      color: #e6e6f2;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      font-size: 28px;
      margin: 0 0 8px;
      background: linear-gradient(135deg, #00dc82, #00b866);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .subtitle {
      color: #94949e;
      margin-bottom: 32px;
    }
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .card {
      background: #12121a;
      border: 1px solid #1f2030;
      border-radius: 12px;
      padding: 20px;
    }
    .card-title {
      font-size: 14px;
      color: #94949e;
      margin-bottom: 8px;
    }
    .card-value {
      font-size: 28px;
      font-weight: 600;
    }
    h2 {
      font-size: 20px;
      margin: 32px 0 16px;
    }
    .post-card {
      background: #12121a;
      border: 1px solid #1f2030;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .post-title {
      font-weight: 600;
      margin-bottom: 8px;
    }
    .post-meta {
      color: #94949e;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>Growth OS Performance Report</h1>
  <div class="subtitle">
    Period: ${from ?? 'All time'} → ${to ?? 'Present'}
    ${campaign_id ? ` • Campaign: ${campaign_id}` : ''}
  </div>
  
  <div class="row">
    <div class="card">
      <div class="card-title">Total Views (30d)</div>
      <div class="card-value">${(krow.views_30d ?? 0).toLocaleString()}</div>
    </div>
    <div class="card">
      <div class="card-title">Avg Engagement Rate</div>
      <div class="card-value">${(krow.avg_er_30d ?? 0).toFixed(2)}%</div>
    </div>
    <div class="card">
      <div class="card-title">Posts Created</div>
      <div class="card-value">${krow.posts_30d ?? 0}</div>
    </div>
    <div class="card">
      <div class="card-title">Active Campaigns</div>
      <div class="card-value">${krow.active_campaigns ?? 0}</div>
    </div>
  </div>

  <h2>Top Performing Content</h2>
  ${(tops ?? []).map((post: any) => `
    <div class="post-card">
      <div class="post-title">${post.title ?? '(Untitled)'}</div>
      <div class="post-meta">
        ${post.platform} • ${(post.views ?? 0).toLocaleString()} views • 
        ${(post.engagement_rate ?? 0).toFixed(2)}% ER • 
        ${(post.likes ?? 0).toLocaleString()} likes
      </div>
    </div>
  `).join('')}
</body>
</html>`;

    // Create data URL
    const url = `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`;

    console.log('[report-generate] Report generated successfully');

    return new Response(JSON.stringify({ ok: true, report_url: url }), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('[report-generate] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
