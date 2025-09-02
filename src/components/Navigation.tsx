import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Brain, 
  Home, 
  Link,
  Settings,
  TrendingUp 
} from 'lucide-react';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, active: true },
  { id: 'connect', label: 'Connect', icon: Link, active: false },
  { id: 'insights', label: 'Insights', icon: Brain, active: false },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, active: false },
];

export default function Navigation() {
  const [activeTab, setActiveTab] = useState('dashboard');

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

        {/* Dashboard Text */}
        <span className="text-muted-foreground">Dashboard</span>
      </div>
    </nav>
  );
}