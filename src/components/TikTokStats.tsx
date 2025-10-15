import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TikTokData {
  username?: string;
  display_name: string;
  avatar_url: string;
  follower_count: number;
  following_count: number;
  video_count: number;
}

export function TikTokStats() {
  const [data, setData] = useState<TikTokData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTikTokData();
    
    // Listen for URL changes (after OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('connected') === 'tiktok') {
      // Delay to ensure backend has saved the data
      setTimeout(() => fetchTikTokData(), 1000);
    }
  }, []);

  const fetchTikTokData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[TikTokStats] No authenticated user');
        return;
      }

      console.log('[TikTokStats] Fetching TikTok account for user:', user.id);

      const { data: account, error } = await supabase
        .from('social_accounts')
        .select('handle, display_name, avatar_url, follower_count, following_count, video_count')
        .eq('platform', 'tiktok')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[TikTokStats] Query error:', error);
      } else if (account) {
        console.log('[TikTokStats] Found account:', account.handle || account.display_name);
        setData({
          username: account.handle || account.display_name,
          display_name: account.display_name,
          avatar_url: account.avatar_url,
          follower_count: account.follower_count || 0,
          following_count: account.following_count || 0,
          video_count: account.video_count || 0,
        });
      } else {
        console.log('[TikTokStats] No TikTok account found');
      }
    } catch (error) {
      console.error('[TikTokStats] Error fetching TikTok data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">No TikTok account connected.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-card/50">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={data.avatar_url}
          alt={data.username}
          className="h-12 w-12 rounded-full ring-2 ring-primary/20"
        />
        <div>
          <p className="font-semibold">@{data.username}</p>
          <p className="text-xs text-muted-foreground">TikTok Connected</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-2 rounded-lg bg-background/50">
          <p className="text-lg font-semibold">{data.follower_count.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
        <div className="p-2 rounded-lg bg-background/50">
          <p className="text-lg font-semibold">{data.following_count.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Following</p>
        </div>
        <div className="p-2 rounded-lg bg-background/50">
          <p className="text-lg font-semibold">{data.video_count.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Videos</p>
        </div>
      </div>
    </Card>
  );
}
