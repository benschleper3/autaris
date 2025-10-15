import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { buildTikTokAuthUrl, getCurrentUser, isTikTokConnected } from '@/lib/tiktok';
import { Button } from '@/components/ui/button';

export default function TikTokCard() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    (async () => setConnected(await isTikTokConnected()))();
  }, []);

  async function handleConnect() {
    const { id } = await getCurrentUser();
    const url = buildTikTokAuthUrl(id);
    window.location.href = url;
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">TikTok</h3>
        <Badge variant={connected ? 'default' : 'outline'}>
          {connected ? 'Connected' : 'Not Connected'}
        </Badge>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Connect your TikTok to pull profile stats and power analytics.
      </p>
      <Button onClick={handleConnect} className="w-full">
        {connected ? 'Reconnect' : 'Connect TikTok'}
      </Button>
    </div>
  );
}
