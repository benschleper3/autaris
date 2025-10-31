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
    const { full_name, timezone, avatar_url, phone, metadata } = body;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (full_name !== undefined) updates.full_name = full_name;
    if (timezone !== undefined) updates.timezone = timezone;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (phone !== undefined) updates.phone = phone;
    if (metadata !== undefined) updates.metadata = metadata;

    const { data: existing } = await supaAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supaAdmin
        .from('profiles')
        .update(updates)
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ profile: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      const { data, error } = await supaAdmin
        .from('profiles')
        .insert({ user_id, ...updates })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ profile: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('[profile-update] Exception:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
