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

        {/* Navigation Items */}
        <div className="flex items-center gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                  isActive 
                    ? "bg-growth-primary text-white" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
        <Settings className="w-5 h-5" />
      </button>
    </nav>
  );
}