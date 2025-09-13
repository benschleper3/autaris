import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { from, to, platform } = await req.json();

    // Get user
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    console.log('Generating insights for user:', userData.user.id);

    // Get posts data for context
    const { data: posts, error: postsError } = await supabaseClient
      .from('v_posts_with_latest')
      .select('*')
      .eq('user_id', userData.user.id)
      .gte('created_at', from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', to || new Date().toISOString());

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch posts data' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Generate AI insights
    const prompt = `Analyze this UGC creator's performance data and provide actionable insights:

Posts Data: ${JSON.stringify(posts)}
Platform Filter: ${platform}
Date Range: ${from} to ${to}

Provide a brief narrative (max 2 sentences) about their content performance and 2-3 specific recommendations for improvement. Focus on engagement trends, posting patterns, and content optimization.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a UGC performance analyst. Provide concise, actionable insights.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    const insights = aiData.choices[0].message.content;

    // Store insights in database
    const { error: insertError } = await supabaseClient
      .from('weekly_insights')
      .insert({
        user_id: userData.user.id,
        week_start: new Date().toISOString().split('T')[0],
        narrative: insights.split('\n')[0],
        recommendations: insights,
      });

    if (insertError) {
      console.error('Error storing insights:', insertError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      insights,
      narrative: insights.split('\n')[0],
      recommendations: insights 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-ugc-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});