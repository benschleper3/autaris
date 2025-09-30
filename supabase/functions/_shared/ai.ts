export async function weeklySummary(payload: {
  kpis: { 
    views_30d: number; 
    avg_er_30d: number; 
    posts_30d: number; 
    active_campaigns: number;
  };
  topPosts: Array<{ 
    title: string | null; 
    platform: string; 
    views: number; 
    engagement_rate: number;
  }>;
  trend: Array<{ 
    day: string; 
    views: number; 
    er: number;
  }>;
}): Promise<{
  narrative: string;
  recommendations: string;
  confidence: number;
}> {
  const prompt = `
You are Growth OS AI. Write a concise weekly summary for a UGC creator.

Data:
- KPIs (30d): ${JSON.stringify(payload.kpis)}
- Top Posts (5): ${JSON.stringify(payload.topPosts.slice(0, 5))}
- Trend: ${JSON.stringify(payload.trend)}

Return strict JSON: {"narrative":string,"recommendations":string,"confidence":number}

Keep narrative under 200 words. Make recommendations actionable.
`.trim();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    console.error('[AI] OpenAI API error:', await res.text());
    throw new Error(`OpenAI API failed: ${res.status}`);
  }

  const j = await res.json();
  const text = j?.choices?.[0]?.message?.content ?? '{}';
  
  try {
    return JSON.parse(text);
  } catch {
    return { 
      narrative: text, 
      recommendations: '', 
      confidence: 0.7 
    };
  }
}
