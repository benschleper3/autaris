import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { role, from, to, campaign_id } = await req.json();

    // Get user
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    console.log('Generating report for user:', userData.user.id, 'role:', role);

    // Generate a unique report URL (this would normally be a PDF generation service)
    const reportId = crypto.randomUUID();
    const reportUrl = `https://reports.example.com/ugc-report-${reportId}.pdf`;

    // Get campaign name if campaign_id is provided
    let campaignName = null;
    if (campaign_id) {
      const { data: campaign } = await supabaseClient
        .from('campaigns')
        .select('campaign_name')
        .eq('id', campaign_id)
        .eq('user_id', userData.user.id)
        .single();
      campaignName = campaign?.campaign_name;
    }

    // Store the report link
    const { data: reportLink, error: reportError } = await supabaseClient
      .from('report_links')
      .insert({
        user_id: userData.user.id,
        title: `UGC Report${campaignName ? ` - ${campaignName}` : ''}`,
        report_type: role,
        from_date: from,
        to_date: to,
        campaign_id: campaign_id,
        url: reportUrl,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error storing report link:', reportError);
      return new Response(JSON.stringify({ error: 'Failed to store report' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      report_url: reportUrl,
      report_id: reportLink.id,
      title: reportLink.title
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in reports-generate function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});