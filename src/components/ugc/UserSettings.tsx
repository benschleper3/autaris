import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Link2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ConnectTikTokButton } from '@/components/ConnectTikTokButton';
import DisconnectTikTok from '@/components/DisconnectTikTok';
import { useTikTokAccount } from '@/hooks/useTikTokAccount';

interface SocialAccount {
  platform: string;
  handle: string;
  status: string;
  last_synced_at: string;
}

interface UserProfile {
  email: string;
  full_name: string;
  avatar_url?: string;
}

export default function UserSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { account: tiktokAccount } = useTikTokAccount();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setProfile({
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);


  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed from here
              </p>
            </div>

            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile?.full_name || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Profile information is read-only
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  UGC Creator
                </Badge>
                <span className="text-sm text-muted-foreground">Your current role</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TikTok Integration */}
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              TikTok Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tiktokAccount ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                  {tiktokAccount.avatar_url && (
                    <img 
                      src={tiktokAccount.avatar_url} 
                      className="h-12 w-12 rounded-full" 
                      alt="TikTok avatar" 
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{tiktokAccount.display_name || 'TikTok Account'}</div>
                    <div className="text-sm text-muted-foreground">
                      @{tiktokAccount.handle || 'connected'}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{tiktokAccount.follower_count?.toLocaleString() || 0} followers</span>
                      <span>{tiktokAccount.video_count || 0} videos</span>
                    </div>
                  </div>
                  <DisconnectTikTok />
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-300">
                  Connected
                </Badge>
              </div>
            ) : (
              <div className="text-center py-8">
                <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Connect your TikTok account</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Track your TikTok performance and analytics
                </p>
                <ConnectTikTokButton />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}