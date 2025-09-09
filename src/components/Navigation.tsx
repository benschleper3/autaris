import { cn } from '@/lib/utils';
import { 
  TrendingUp,
  Users,
  Video,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

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
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-growth-primary to-growth-secondary bg-clip-text text-transparent">
            Growth OS
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
      
      {/* Settings/Profile section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
}