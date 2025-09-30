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

interface NavigationProps {
  // Remove old props since we'll detect current route
}

export default function Navigation({}: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isCreatorDashboard = location.pathname === '/dashboard-creator';
  const isUGCDashboard = location.pathname === '/dashboard-ugc';
  
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
          <span className="text-xl font-bold bg-gradient-to-r from-autaris-primary to-autaris-secondary bg-clip-text text-transparent">
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
            <DropdownMenuItem>
              Connect TikTok Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}