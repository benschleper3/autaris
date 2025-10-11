import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users, Heart, Video } from 'lucide-react';

interface TikTokProfile {
  display_name: string;
  avatar_url: string;
  follower_count: number;
  like_count: number;
  video_count: number;
}

export default function TikTokProfileCard() {
  const [profile, setProfile] = useState<TikTokProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_accounts')
        .select('display_name, avatar_url, follower_count, like_count, video_count')
        .eq('user_id', user.id)
        .eq('platform', 'tiktok')
        .maybeSingle();

      if (error) throw error;
      if (data) setProfile(data as TikTokProfile);
    } catch (error) {
      console.error('Error fetching TikTok profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>TikTok Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleConnect = () => {
    window.location.href = `https://gjfbxqsjxasubvnpeeie.supabase.co/functions/v1/tiktok-start`;
  };

  // Show connect button if no profile or if profile data is incomplete
  if (!profile || !profile.display_name) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>TikTok Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {!profile 
              ? "No TikTok account connected. Connect your TikTok to view analytics."
              : "TikTok account needs to be connected. Click below to complete setup."}
          </p>
          <Button onClick={handleConnect} className="w-full">
            {!profile ? "Connect TikTok Account" : "Complete TikTok Connection"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const displayName = profile.display_name || 'TikTok User';
  const avatarUrl = profile.avatar_url || undefined;
  const username = profile.display_name 
    ? `@${profile.display_name.toLowerCase().replace(/\s+/g, '')}` 
    : '@tiktokuser';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardTitle>TikTok Profile</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{displayName}</h3>
            <p className="text-sm text-muted-foreground">{username}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
            <Users className="h-5 w-5 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{profile.follower_count.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Followers</div>
          </div>

          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20">
            <Heart className="h-5 w-5 mx-auto mb-2 text-pink-600" />
            <div className="text-2xl font-bold">{profile.like_count.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Likes</div>
          </div>

          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
            <Video className="h-5 w-5 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{profile.video_count}</div>
            <div className="text-xs text-muted-foreground mt-1">Videos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
