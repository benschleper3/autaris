import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, Eye } from 'lucide-react';

const topPosts = [
  {
    id: 1,
    content: "Just launched my new coaching program! 🚀 Transform your business in 90 days with proven strategies...",
    platform: "LinkedIn",
    likes: 342,
    comments: 89,
    shares: 45,
    views: 12500,
    engagement: "8.2%"
  },
  {
    id: 2,
    content: "3 mindset shifts that changed everything for my consulting business. Thread 🧵",
    platform: "Twitter",
    likes: 189,
    comments: 34,
    shares: 67,
    views: 8900,
    engagement: "6.8%"
  },
  {
    id: 3,
    content: "Behind the scenes of building a 6-figure coaching business. What they don't tell you...",
    platform: "Instagram",
    likes: 256,
    comments: 43,
    shares: 28,
    views: 9800,
    engagement: "7.1%"
  }
];

export default function TopPosts() {
  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-growth-primary/20 hover:bg-card/80 cursor-pointer">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Top Performing Posts</h3>
        <p className="text-sm text-muted-foreground">Your best content from this week</p>
      </div>
      
      <div className="space-y-4">
        {topPosts.map((post, index) => (
          <div key={post.id} className="p-4 rounded-lg bg-secondary/30 border border-border/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-growth-primary/10 hover:bg-secondary/40 cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-growth-primary">#{index + 1}</span>
                <Badge variant="secondary" className="text-xs">
                  {post.platform}
                </Badge>
                <span className="text-xs text-growth-success font-medium">
                  {post.engagement} engagement
                </span>
              </div>
            </div>
            
            <p className="text-sm text-foreground mb-3 line-clamp-2">
              {post.content}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {post.likes}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {post.comments}
                </div>
                <div className="flex items-center gap-1">
                  <Share className="w-3 h-3" />
                  {post.shares}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.views.toLocaleString()} views
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}