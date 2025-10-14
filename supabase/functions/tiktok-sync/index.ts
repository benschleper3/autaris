// supabase/functions/tiktok-sync/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

serve(async (req: Request) => {
  const origin = Deno.env.get("APP_BASE_URL") ?? "*";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const sandbox = (Deno.env.get("SANDBOX_TIKTOK") ?? "false") === "true";
    const body = await req.json().catch(() => ({}));

    if (body?.dryrun === true) {
      return new Response(JSON.stringify({
        ok: true,
        sandbox,
        follower_count: 1245,
        likes_count: 31877,
        video_count: 61,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Minimal success stub for non-dryrun
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });

  } catch (err) {
    console.error("tiktok-sync error:", err);
    return new Response(JSON.stringify({ ok: false, error: "internal_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }
});
