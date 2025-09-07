import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ExternalLink, Image, BarChart3, Star } from 'lucide-react';
import { toast } from '../ui/use-toast';

export default function PortfolioBuilder() {
  const handleGeneratePortfolio = () => {
    toast({
      title: "Portfolio Generated!",
      description: "Your portfolio page is ready to share with brands.",
    });
  };

  const topPosts = [
    {
      platform: 'TikTok',
      thumbnail: '/placeholder.svg',
      caption: 'Morning skincare routine that changed my life! ✨',
      views: '1.2M',
      likes: '85.4K',
      engagement: '8.9%',
      color: 'bg-pink-500'
    },
    {
      platform: 'Instagram',
      thumbnail: '/placeholder.svg',
      caption: 'OOTD: Casual chic for coffee dates ☕',
      views: '456K',
      likes: '34.2K',
      engagement: '7.5%',
      color: 'bg-purple-500'
    },
    {
      platform: 'YouTube',
      thumbnail: '/placeholder.svg',
      caption: 'My honest review of viral makeup products',
      views: '89.3K',
      likes: '6.7K',
      engagement: '12.1%',
      color: 'bg-red-500'
    }
  ];

  return (
    <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Portfolio Builder</h3>
        <Star className="w-5 h-5 text-growth-secondary" />
      </div>

      <div className="space-y-4">
        {/* Portfolio Actions */}
        <div className="grid grid-cols-1 gap-2">
          <Button onClick={handleGeneratePortfolio} className="w-full" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Generate Portfolio Link
          </Button>
        </div>

        {/* Top Performing Posts */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Top Performing Posts</h4>
          {topPosts.map((post, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <Image className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${post.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{post.caption}</div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{post.views}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {post.engagement} ER
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio Stats */}
        <div className="p-2 rounded-lg bg-growth-secondary/5 border border-growth-secondary/20">
          <div className="text-xs text-muted-foreground text-center">
            Portfolio showcases your top 20 performing posts across all platforms
          </div>
        </div>
      </div>
    </Card>
  );
}