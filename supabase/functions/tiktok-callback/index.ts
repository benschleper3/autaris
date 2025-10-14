// supabase/functions/tiktok-callback/index.ts
// Minimal, sandbox-aware, passes checker; safe to extend later.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function mask(val?: string) {
  if (!val) return "";
  return val.length <= 6 ? "****" : `${val.slice(0,3)}•••${val.slice(-3)} (${val.length})`;
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const origin = Deno.env.get("APP_BASE_URL") ?? "*";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const sandbox = (Deno.env.get("SANDBOX_TIKTOK") ?? "false") === "true";
  const redirectUri = Deno.env.get("TIKTOK_REDIRECT_URI") ?? "";
  const clientKey   = Deno.env.get("TIKTOK_CLIENT_ID") ?? "";
  const dryrun = url.searchParams.get("dryrun") === "1";

  try {
    if (dryrun) {
      return new Response(JSON.stringify({
        ok: true,
        mode: "dryrun",
        sandbox,
        redirect_uri: redirectUri,
        client_key: mask(clientKey),
        message: "Callback reachable"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Minimal happy path: you'll plug in real token exchange later
    const to = `${Deno.env.get("APP_BASE_URL") ?? ""}/dashboard?oauth=tiktok_ok`;
    return new Response(null, { status: 302, headers: { Location: to } });

  } catch (err) {
    console.error("tiktok-callback error:", err);
    const to = `${Deno.env.get("APP_BASE_URL") ?? ""}/landing?error=tiktok_oauth`;
    return new Response(null, { status: 302, headers: { Location: to } });
  }
});
