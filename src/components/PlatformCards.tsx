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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Platform Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => {
          const TrendIcon = platform.growthType === 'positive' ? TrendingUp : TrendingDown;
          const PlatformIcon = platform.icon;
          
          return (
            <Card key={platform.name} className="p-4 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg bg-gradient-to-r flex items-center justify-center text-white",
                  platform.color
                )}>
                  <PlatformIcon className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="text-xs font-medium">
                  {platform.name}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-2xl font-bold text-foreground">
                  {platform.followers}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {platform.name === 'YOUTUBE' ? 'Subscribers' : 'Followers'}
                </p>
                
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  platform.growthType === 'positive' ? "text-growth-success" : "text-growth-danger"
                )}>
                  <TrendIcon className="w-3 h-3" />
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