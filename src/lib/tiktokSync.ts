import { supabase } from '@/integrations/supabase/client';

export async function syncTikTokVideos() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(`https://gjfbxqsjxasubvnpeeie.supabase.co/functions/v1/tiktok-sync-videos`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to sync videos");
  }

  return res.json();
}
