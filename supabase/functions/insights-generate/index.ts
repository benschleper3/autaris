import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function startOfIsoWeek(d = new Date()) {
  const day = (d.getUTCDay() || 7);
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  if (day !== 1) t.setUTCDate(t.getUTCDate() - day + 1);
  return t.toISOString().slice(0,10);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { 
        status: 405,
        headers: corsHeaders
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
    });

    // 1) Auth
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      return new Response("Unauthorized", { 
        status: 401,
        headers: corsHeaders
      });
    }
    const user_id = user.id;

    console.log(`[insights-generate] Generating insights for user ${user_id}`);

    // Optional filters from body
    const body = await req.json().catch(() => ({}));
    const toISO = body?.to ?? new Date().toISOString();
    const fromISO = body?.from ?? new Date(Date.now() - 30*864e5).toISOString();
    const platform = body?.platform ?? "all";

    const baseFilter = (q: any) => {
      q = q.eq("user_id", user_id);
      if (platform !== "all") q = q.eq("platform", platform);
      return q;
    };

    // 2) Fetch compact context (defensive; handle empty datasets)
    // KPIs 30d
    const { data: posts30, error: e30 } = await baseFilter(
      supabase.from("v_posts_with_latest")
        .select("views, engagement_rate, published_at, created_at")
        .gte("published_at", fromISO)
        .lte("published_at", toISO)
    );
    if (e30) console.log("[insights-generate] kpi30 err", e30);

    // KPIs 7d (subset)
    const from7 = new Date(Date.now() - 7*864e5).toISOString();
    const { data: posts7, error: e7 } = await baseFilter(
      supabase.from("v_posts_with_latest")
        .select("views, engagement_rate, published_at, created_at")
        .gte("published_at", from7)
        .lte("published_at", toISO)
    );
    if (e7) console.log("[insights-generate] kpi7 err", e7);

    // Trend 30d - using get_daily_perf RPC
    const { data: trend30Raw, error: et } = await supabase.rpc('get_daily_perf', {
      p_user_id: user_id,
      p_from: new Date(Date.now() - 30*864e5).toISOString().slice(0,10),
      p_to: new Date().toISOString().slice(0,10),
      p_platform: platform
    });
    if (et) console.log("[insights-generate] trend err", et);
    const trend30 = Array.isArray(trend30Raw) ? trend30Raw : [];

    // Top posts
    const { data: topPosts, error: etop } = await baseFilter(
      supabase.from("v_posts_with_latest")
        .select("title, platform, views, engagement_rate, url, published_at")
        .gte("published_at", fromISO)
        .lte("published_at", toISO)
        .order("engagement_rate", { ascending: false })
        .order("views", { ascending: false })
        .limit(10)
    );
    if (etop) console.log("[insights-generate] top err", etop);

    // Best-time heatmap (top cells) - from v_time_heatmap
    const { data: heat, error: eh } = await baseFilter(
      supabase.from("v_time_heatmap")
        .select("platform, dow, hour, avg_engagement_percent")
        .order("avg_engagement_percent", { ascending: false })
        .limit(12)
    );
    if (eh) console.log("[insights-generate] heat err", eh);

    // Aggregate KPIs safely
    const sum = (arr: any[], k: string) => (arr||[]).reduce((a,b)=>a+Number(b[k]||0),0);
    const avg = (arr: any[], k: string) => {
      if (!arr || !arr.length) return 0;
      return Number((arr.reduce((a,b)=>a+Number(b[k]||0),0) / arr.length).toFixed(2));
    };

    const kpis = {
      views_30d: sum(posts30||[], "views"),
      posts_30d: (posts30||[]).length,
      avg_er_30d: avg(posts30||[], "engagement_rate"),
      views_7d: sum(posts7||[], "views"),
      posts_7d: (posts7||[]).length,
      avg_er_7d: avg(posts7||[], "engagement_rate"),
    };

    console.log("[insights-generate] KPIs:", kpis);

    // Build compact, anonymized context
    const context = {
      kpis,
      trend_30d: (trend30||[]).slice(0, 60),
      top_posts: (topPosts||[]).map(p => ({
        title: p.title, platform: p.platform || 'tiktok', views: p.views, er: p.engagement_rate
      })),
      best_times: (heat||[]),
      platform
    };

    // 3) If too little data, return safe recommendations
    const MIN_POSTS = 3;
    const sparse = (kpis.posts_30d || 0) < MIN_POSTS;

    const system = `You are a growth analyst for short-form and social content. 
Return ONLY valid JSON with this schema:
{
  "summary": string,
  "key_metrics": { "views_7d": number, "views_30d": number, "avg_er_7d": number, "avg_er_30d": number, "posts_7d": number, "posts_30d": number },
  "best_times": [{ "platform": string, "dow": number, "hour": number, "reason": string }],
  "patterns": string[],
  "experiments": string[],
  "recommendations": string[]
}
If data is sparse, say so in "summary" and still provide safe, high-impact recommendations using the provided context. Keep outputs short and actionable.`;

    const userMsg = `User's last 30 days (aggregated, anonymized):
${JSON.stringify(context).slice(0, 8000)}
Generate insights tailored to these metrics. Do not invent data.`;

    const model = "gpt-4o-mini";
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg }
        ],
        temperature: 0.2,
        max_tokens: 700
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[insights-generate] OpenAI error:", aiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const jsonText = aiData.choices?.[0]?.message?.content ?? "{}";
    
    let insights: any = {};
    try { 
      insights = JSON.parse(jsonText); 
    } catch (e) { 
      console.error("[insights-generate] JSON parse error:", e);
      insights = {}; 
    }

    // Fallbacks
    insights.summary ||= sparse
      ? "Not enough recent posts to compute strong insights. Here are safe, high-impact recommendations while you collect more data."
      : "Here are your performance highlights and next steps based on the last 30 days.";

    insights.key_metrics ||= kpis;
    insights.best_times ||= (heat||[]).slice(0,3).map((h:any)=>({ 
      platform: h.platform || 'tiktok', 
      dow: h.dow, 
      hour: h.hour, 
      reason: "Historically higher engagement in this slot." 
    }));
    insights.patterns ||= [];
    insights.experiments ||= [];
    insights.recommendations ||= [];

    console.log("[insights-generate] Generated insights with", 
      insights.patterns?.length || 0, "patterns,",
      insights.experiments?.length || 0, "experiments,",
      insights.recommendations?.length || 0, "recommendations"
    );

    // 4) Upsert into weekly_insights (one per user per ISO week)
    const week_start = startOfIsoWeek();
    
    // Delete existing insight for this week
    await supabase.from("weekly_insights")
      .delete()
      .eq("user_id", user_id)
      .eq("week_start", week_start);

    const { error: insErr } = await supabase.from("weekly_insights").insert({
      user_id,
      week_start,
      summary: insights.summary,
      key_metrics: insights.key_metrics,
      best_times: insights.best_times,
      patterns: insights.patterns,
      experiments: insights.experiments,
      recommendations: insights.recommendations,
    });
    
    if (insErr) {
      console.error("[insights-generate] Insert error:", insErr);
      throw insErr;
    }

    console.log("[insights-generate] Successfully saved insights for week", week_start);

    return new Response(
      JSON.stringify({ ok: true, insights }), 
      { headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  } catch (e) {
    console.error("[insights-generate] Error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, "content-type": "application/json" } 
      }
    );
  }
});