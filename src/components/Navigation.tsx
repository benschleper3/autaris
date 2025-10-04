import { cn } from '@/lib/utils';
import { 
  TrendingUp,
  Users,
  Video,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface NavigationProps {
  // Remove old props since we'll detect current route
}

export default function Navigation({}: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isTikTokConnected, setIsTikTokConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const isCreatorDashboard = location.pathname === '/dashboard-creator';
  const isUGCDashboard = location.pathname === '/dashboard-ugc';
  
  useEffect(() => {
    checkTikTokConnection();
  }, []);

  const checkTikTokConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'tiktok')
        .maybeSingle();

      if (error) throw error;
      setIsTikTokConnected(!!data);
    } catch (error) {
      console.error('Error checking TikTok connection:', error);
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

      setIsTikTokConnected(false);
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
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={isTikTokConnected ? handleTikTokDisconnect : handleTikTokConnect}
              disabled={loading}
            >
              {loading ? 'Loading...' : isTikTokConnected ? 'Disconnect from TikTok' : 'Connect TikTok Account'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}