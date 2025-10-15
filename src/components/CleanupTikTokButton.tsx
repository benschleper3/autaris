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
    if (!confirm('This will delete all your TikTok data (posts, metrics, account info). Continue?')) {
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('cleanup_tiktok_data');
      
      if (error) throw error;

      const result = data as unknown as CleanupResult;
      
      toast({
        title: 'Data Cleaned',
        description: `Deleted ${result.deleted.posts} posts, ${result.deleted.metrics} metrics, ${result.deleted.accounts} accounts`
      });

      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: 'Cleanup Failed',
        description: 'Could not clean TikTok data',
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
      {loading ? 'Cleaning...' : 'Clean TikTok Data'}
    </Button>
  );
}
