import { supabase } from '@/integrations/supabase/client';
import { useTikTokAccount } from '@/hooks/useTikTokAccount';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export default function DisconnectTikTok() {
  const { account, setAccount } = useTikTokAccount();
  const [disconnecting, setDisconnecting] = useState(false);

  const disconnect = async () => {
    if (!account) return;
    
    setDisconnecting(true);
    
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        toast.error('Not authenticated');
        return;
      }

      const token = account?.access_token ?? null;

      // Revoke remote grant (best-effort)
      if (token) {
        try {
          await supabase.functions.invoke('tiktok-revoke', {
            body: { access_token: token }
          });
        } catch (err) {
          console.error('[DisconnectTikTok] Revoke failed (non-blocking):', err);
        }
      }

      // Remove local row (persistent disconnect)
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', uid)
        .eq('platform', 'tiktok');

      if (error) {
        toast.error('Failed to disconnect TikTok');
        console.error('[DisconnectTikTok] Delete error:', error);
        return;
      }

      // Guarantee consent next connect
      try { 
        localStorage.setItem('tiktok_force_consent', '1'); 
      } catch {}

      setAccount(null);
      toast.success('TikTok account disconnected');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <Button 
      onClick={disconnect} 
      variant="outline" 
      size="sm"
      disabled={disconnecting}
    >
      {disconnecting ? 'Disconnecting...' : 'Disconnect'}
    </Button>
  );
}
