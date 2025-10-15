import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface CleanupResult {
  success: boolean;
  deleted: {
    metrics: number;
    posts: number;
    accounts: number;
  };
}

export function CleanupTikTokButton() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCleanup = async () => {
    if (!confirm('This will disconnect your TikTok account and delete all associated data (posts, metrics). Continue?')) {
      return;
    }

    try {
      setLoading(true);
      console.log('[Cleanup] Starting TikTok disconnect...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get social account ID first
      const { data: account } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'tiktok')
        .maybeSingle();

      if (!account) {
        toast({
          title: 'No Connection',
          description: 'No TikTok account found to disconnect'
        });
        return;
      }

      console.log('[Cleanup] Found account:', account.id);

      // Delete in correct order due to foreign keys
      // 1. Get all post IDs first
      const { data: posts } = await supabase
        .from('posts')
        .select('id')
        .eq('social_account_id', account.id);

      const postIds = posts?.map(p => p.id) || [];

      // 2. Delete post metrics
      if (postIds.length > 0) {
        const { error: metricsError } = await supabase
          .from('post_metrics')
          .delete()
          .in('post_id', postIds);

        if (metricsError) {
          console.warn('[Cleanup] Metrics deletion warning:', metricsError);
        }
      }

      // 3. Delete posts
      const { error: postsError } = await supabase
        .from('posts')
        .delete()
        .eq('social_account_id', account.id);

      if (postsError) {
        console.warn('[Cleanup] Posts deletion warning:', postsError);
      }

      // 4. Delete social account
      const { error: accountError } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', account.id);

      if (accountError) throw accountError;
      
      console.log('[Cleanup] Successfully disconnected TikTok');
      
      toast({
        title: 'Disconnected',
        description: 'TikTok account has been disconnected'
      });

      console.log('[Cleanup] Reloading page...');
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('[Cleanup] Disconnect error:', error);
      toast({
        title: 'Disconnect Failed',
        description: error instanceof Error ? error.message : 'Could not disconnect TikTok',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCleanup} 
      variant="destructive" 
      size="sm"
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Trash2 className="w-4 h-4" />
      {loading ? 'Disconnecting...' : 'Disconnect TikTok'}
    </Button>
  );
}
