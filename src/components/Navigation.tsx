import { cn } from '@/lib/utils';
import { 
  TrendingUp,
  Users,
  Video,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TikTokProfile {
  display_name: string | null;
  avatar_url: string | null;
  follower_count: number;
  like_count: number;
  video_count: number;
}

interface NavigationProps {
  // Remove old props since we'll detect current route
}

export default function Navigation({}: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [tiktokProfile, setTiktokProfile] = useState<TikTokProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isCreatorDashboard = location.pathname === '/dashboard-creator';
  const isUGCDashboard = location.pathname === '/dashboard-ugc';
  
  useEffect(() => {
    fetchTikTokProfile();
  }, []);

  const fetchTikTokProfile = async () => {
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
      setTiktokProfile(data);
    } catch (error) {
      console.error('Error fetching TikTok profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTikTokConnect = async () => {
    try {
      const functionUrl = 'https://gjfbxqsjxasubvnpeeie.supabase.co/functions/v1/tiktok-start';
      window.location.href = functionUrl;
    } catch (error) {
      console.error('Error connecting TikTok:', error);
      toast({
        title: "Connection Failed",
        description: "Could not initiate TikTok connection.",
        variant: "destructive"
      });
    }
  };

  const handleTikTokDisconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', 'tiktok');

      if (error) throw error;

      setTiktokProfile(null);
      toast({
        title: "Disconnected",
        description: "TikTok account has been disconnected."
      });
    } catch (error) {
      console.error('Error disconnecting TikTok:', error);
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect TikTok account.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  const handleDashboardSwitch = (type: 'creator' | 'ugc') => {
    if (type === 'creator') {
      navigate('/dashboard-creator');
    } else {
      navigate('/dashboard-ugc');
    }
  };
  return (
    <nav className="flex items-center justify-between w-full px-6 py-4 border-b border-border/50">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Autaris Logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-autaris-primary">
            Autaris
          </span>
        </div>

        {/* Dashboard Toggle - Show only on dashboard pages */}
        {(isCreatorDashboard || isUGCDashboard) && (
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={isCreatorDashboard ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleDashboardSwitch('creator')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Creator
            </Button>
            <Button
              variant={isUGCDashboard ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleDashboardSwitch('ugc')}
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              UGC Creator
            </Button>
          </div>
        )}
      </div>
      
      {/* Profile section */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              {tiktokProfile?.avatar_url ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={tiktokProfile.avatar_url} alt={tiktokProfile.display_name || 'User'} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="w-5 h-5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* TikTok Profile Info */}
            {tiktokProfile && tiktokProfile.display_name ? (
              <>
                <div className="px-2 py-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tiktokProfile.avatar_url || undefined} alt={tiktokProfile.display_name} />
                      <AvatarFallback>{tiktokProfile.display_name[0]?.toUpperCase() || 'T'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{tiktokProfile.display_name}</p>
                      <p className="text-xs text-muted-foreground">TikTok Connected</p>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-bold">{tiktokProfile.follower_count.toLocaleString()}</div>
                      <div className="text-muted-foreground">Followers</div>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-bold">{tiktokProfile.like_count.toLocaleString()}</div>
                      <div className="text-muted-foreground">Likes</div>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-bold">{tiktokProfile.video_count}</div>
                      <div className="text-muted-foreground">Videos</div>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleTikTokDisconnect}>
                  Disconnect TikTok
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={handleTikTokConnect}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Connect TikTok Account'}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}