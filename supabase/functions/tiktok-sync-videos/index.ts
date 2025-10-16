import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function pickFields() {
  return [
    "id","create_time","title","video_description",
    "duration","width","height",
    "cover_image_url","share_url","embed_link",
    "view_count","like_count","comment_count","share_count"
  ].join(",");
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
  });

  // 1) Auth → user_id
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }
  const user_id = user.id;

  console.log("Syncing TikTok videos for user:", user_id);

  // 2) Get access_token from social_accounts
  const { data: acct, error: acctErr } = await supabase
    .from("social_accounts")
    .select("access_token, external_id")
    .eq("user_id", user_id)
    .eq("platform", "tiktok")
    .maybeSingle();

  if (acctErr || !acct?.access_token) {
    console.error("No TikTok access_token:", acctErr);
    return new Response(JSON.stringify({ ok: false, error: "No TikTok access_token" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  // 3) Page through /v2/video/list/
  const token = acct.access_token as string;
  const openId = acct.external_id as string | null;
  let cursor: number | undefined = undefined;
  let total = 0;

  for (let page = 0; page < 10; page++) {
    const url = `https://open.tiktokapis.com/v2/video/list/?fields=${encodeURIComponent(pickFields())}`;
    console.log(`Fetching page ${page + 1}...`);
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ max_count: 20, ...(cursor ? { cursor } : {}) })
    });

    const raw = await res.text();
    let body: any = {};
    try {
      body = JSON.parse(raw);
    } catch {
      console.error("Failed to parse response:", raw);
      body = { parse_error: raw };
    }

    if (!res.ok) {
      const msg = body?.error?.message || `HTTP ${res.status}`;
      console.error("video.list failed:", msg, body);
      return new Response(JSON.stringify({ ok: false, error: `video.list failed: ${msg}` }), {
        status: 502,
        headers: { "content-type": "application/json" }
      });
    }

    const data = body?.data;
    const videos = data?.videos || [];
    cursor = data?.cursor;
    const has_more = !!data?.has_more;

    console.log(`Found ${videos.length} videos on page ${page + 1}`);

    // 4) Upsert rows
    const rows = videos.map((v: any) => ({
      user_id,
      open_id: openId ?? null,
      video_id: v.id,
      title: v.title ?? null,
      video_description: v.video_description ?? null,
      share_url: v.share_url ?? null,
      embed_link: v.embed_link ?? null,
      cover_image_url: v.cover_image_url ?? null,
      duration_seconds: v.duration ?? null,
      width: v.width ?? null,
      height: v.height ?? null,
      create_time: v.create_time ? new Date(v.create_time * 1000).toISOString() : null,
      view_count: v.view_count ?? null,
      like_count: v.like_count ?? null,
      comment_count: v.comment_count ?? null,
      share_count: v.share_count ?? null,
      last_synced_at: new Date().toISOString()
    }));

    if (rows.length) {
      const { error: upErr } = await supabase.from("tiktok_videos").upsert(rows, {
        onConflict: "user_id,video_id",
        ignoreDuplicates: false
      });
      if (upErr) {
        console.error("Upsert error:", upErr);
        return new Response(JSON.stringify({ ok: false, error: `upsert error: ${upErr.message}` }), {
          status: 500,
          headers: { "content-type": "application/json" }
        });
      }
      total += rows.length;
    }

    if (!has_more) break;
  }

  console.log(`Successfully synced ${total} videos`);
  return new Response(JSON.stringify({ ok: true, synced: total }), {
    headers: { "content-type": "application/json" }
  });
});
