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

    const { post_id } = await req.json();

    // Get user
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    console.log('Analyzing post:', post_id, 'for user:', userData.user.id);

    // Get specific post data
    const { data: post, error: postError } = await supabaseClient
      .from('v_posts_with_latest')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('post_id', post_id)
      .single();

    if (postError || !post) {
      console.error('Error fetching post:', postError);
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Generate AI analysis
    const prompt = `Analyze this high-performing UGC post and provide specific insights:

Post Details:
- Title: ${post.title}
- Platform: ${post.platform}
- Views: ${post.views}
- Engagement Rate: ${post.engagement_rate}%
- Likes: ${post.likes}
- Comments: ${post.comments}
- Shares: ${post.shares}

Provide:
1. Angle: What unique angle or approach made this post successful?
2. What to replicate: 2-3 specific elements that should be replicated in future content
3. Next test: 1 specific variation to test based on this post's success

Keep each section to 1-2 sentences maximum.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a UGC content strategist analyzing successful posts.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    const analysis = aiData.choices[0].message.content;

    // Parse the analysis into structured format
    const lines = analysis.split('\n').filter(line => line.trim());
    let angle = '', what_to_replicate = '', next_test = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('angle')) {
        angle = lines[i + 1] || lines[i].split(':')[1] || '';
      } else if (line.includes('replicate')) {
        what_to_replicate = lines[i + 1] || lines[i].split(':')[1] || '';
      } else if (line.includes('test')) {
        next_test = lines[i + 1] || lines[i].split(':')[1] || '';
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      angle: angle.trim(),
      what_to_replicate: what_to_replicate.trim(),
      next_test: next_test.trim(),
      full_analysis: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-ugc-post-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});