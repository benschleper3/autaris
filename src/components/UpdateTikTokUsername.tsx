import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pencil } from 'lucide-react';

export function UpdateTikTokUsername() {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleUpdate = async () => {
    if (!username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter your TikTok username',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      console.log('[UpdateUsername] Updating TikTok username to:', username);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update the social account with the correct username
      const { error } = await supabase
        .from('social_accounts')
        .update({
          display_name: username,
          handle: username
        })
        .eq('user_id', user.id)
        .eq('platform', 'tiktok');

      if (error) throw error;

      console.log('[UpdateUsername] Successfully updated username');
      
      toast({
        title: 'Username Updated',
        description: `TikTok username set to @${username}`
      });

      setEditing(false);
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('[UpdateUsername] Update error:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Could not update username',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <Button 
        onClick={() => setEditing(true)} 
        variant="outline" 
        size="sm"
        className="flex items-center gap-2"
      >
        <Pencil className="w-4 h-4" />
        Update Username
      </Button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <Input
        placeholder="Enter your TikTok username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="max-w-xs"
        disabled={loading}
      />
      <Button 
        onClick={handleUpdate} 
        disabled={loading}
        size="sm"
      >
        {loading ? 'Updating...' : 'Save'}
      </Button>
      <Button 
        onClick={() => setEditing(false)} 
        variant="ghost"
        size="sm"
        disabled={loading}
      >
        Cancel
      </Button>
    </div>
  );
}
