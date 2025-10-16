import { useState } from "react";
import { syncTikTokVideos } from "@/lib/tiktokSync";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SyncTikTokButton() {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    try {
      setLoading(true);
      const result = await syncTikTokVideos();
      toast.success(`Synced ${result.synced} TikTok videos`);
      window.location.reload();
    } catch (e: any) {
      toast.error(`Sync failed: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={loading}
      variant="default"
    >
      {loading ? "Syncing…" : "Sync TikTok Videos"}
    </Button>
  );
}
