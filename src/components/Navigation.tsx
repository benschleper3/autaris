import { cn } from '@/lib/utils';
import { 
  TrendingUp,
  Users,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  dashboardView?: string;
  onViewChange?: (view: string) => void;
}

export default function Navigation({ dashboardView, onViewChange }: NavigationProps) {
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

        {/* Dashboard Toggle */}
        {dashboardView && onViewChange && (
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={dashboardView === 'creator' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('creator')}
              className="flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              Creator
            </Button>
            <Button
              variant={dashboardView === 'coach' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('coach')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Coach
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}