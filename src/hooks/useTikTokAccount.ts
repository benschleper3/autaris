import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TikTokAccount = {
  id: string;
  user_id: string;
  platform: string;
  display_name: string | null;
  avatar_url: string | null;
  access_token: string | null;
  follower_count: number | null;
  following_count: number | null;
  like_count: number | null;
  video_count: number | null;
  handle: string | null;
  status: string | null;
};

export function useTikTokAccount() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<TikTokAccount | null>(null);

  useEffect(() => {
    let active = true;
    
    const fetchAccount = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) { 
        setLoading(false); 
        return; 
      }

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', uid)
        .eq('platform', 'tiktok')
        .maybeSingle();

      if (!active) return;
      if (!error && data) {
        setAccount(data as TikTokAccount);
      }
      setLoading(false);
    };

    fetchAccount();

    return () => { 
      active = false; 
    };
  }, []);

  return { loading, account, setAccount };
}
