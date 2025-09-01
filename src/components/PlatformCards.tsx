import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { FaInstagram, FaYoutube, FaXTwitter, FaLinkedin } from 'react-icons/fa6';

interface PlatformData {
  name: string;
  followers: string;
  growth: string;
  growthType: 'positive' | 'negative';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const platforms: PlatformData[] = [
  {
    name: 'INSTAGRAM',
    followers: '12,450',
    growth: '+7.2%',
    growthType: 'positive',
    icon: FaInstagram,
    color: 'from-pink-500 to-orange-500'
  },
  {
    name: 'YOUTUBE',
    followers: '8,310',
    growth: '+8%',
    growthType: 'positive',
    icon: FaYoutube,
    color: 'from-red-500 to-red-600'
  },
  {
    name: 'X',
    followers: '1,725',
    growth: '+2.1%',
    growthType: 'positive',
    icon: FaXTwitter,
    color: 'from-gray-600 to-black'
  },
  {
    name: 'LINKEDIN',
    followers: '3,892',
    growth: '+12.4%',
    growthType: 'positive',
    icon: FaLinkedin,
    color: 'from-blue-600 to-blue-700'
  }
];

export default function PlatformCards() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-4">Platform Analytics</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {platforms.map((platform) => {
          const TrendIcon = platform.growthType === 'positive' ? TrendingUp : TrendingDown;
          const PlatformIcon = platform.icon;
          
          return (
            <Card key={platform.name} className="p-3 sm:p-4 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-growth-primary/20 hover:bg-card/80 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r flex items-center justify-center text-white",
                  platform.color
                )}>
                  <PlatformIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium px-1 py-0.5 sm:px-2 sm:py-1">
                  {platform.name}
                </Badge>
              </div>
              
              <div className="space-y-0.5 sm:space-y-1">
                <h4 className="text-sm sm:text-xl font-bold text-foreground">
                  {platform.followers}
                </h4>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {platform.name === 'YOUTUBE' ? 'Subscribers' : 'Followers'}
                </p>
                
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  platform.growthType === 'positive' ? "text-growth-success" : "text-growth-danger"
                )}>
                  <TrendIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {platform.growth}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}