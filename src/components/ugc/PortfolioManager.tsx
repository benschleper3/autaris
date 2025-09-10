import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Briefcase, Star, Eye, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface PortfolioItem {
  id: string;
  post_id: string;
  highlight: boolean;
  position: number;
  title: string;
  platform: string;
  engagement_rate: number;
  views: number;
  url?: string;
}

export default function PortfolioManager() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('id, post_id, title, description, featured, image_url')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedItems = (data || []).map(item => ({
          id: item.id,
          post_id: item.post_id,
          highlight: item.featured || false,
          position: 0,
          title: item.title || 'Untitled',
          platform: 'Unknown',
          engagement_rate: 0,
          views: 0,
          url: ''
        }));

        setPortfolioItems(formattedItems);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const toggleHighlight = async (id: string, currentHighlight: boolean) => {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .update({ featured: !currentHighlight })
        .eq('id', id);

      if (error) throw error;

      setPortfolioItems(items => 
        items.map(item => 
          item.id === id ? { ...item, highlight: !currentHighlight } : item
        )
      );

      toast({
        title: "Portfolio Updated",
        description: `Post ${!currentHighlight ? 'highlighted' : 'unhighlighted'}`,
      });
    } catch (error) {
      console.error('Error toggling highlight:', error);
      toast({
        title: "Error",
        description: "Failed to update portfolio",
        variant: "destructive",
      });
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'tiktok': return 'bg-pink-500/10 text-pink-700 dark:text-pink-300';
      case 'instagram': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'youtube': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Builder</h1>
          <p className="text-muted-foreground mt-1">Showcase your best content to brands</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Portfolio Builder
          </h1>
          <p className="text-muted-foreground mt-1">Showcase your best content to brands</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent text-white">
          <Briefcase className="w-4 h-4 mr-2" />
          Generate Portfolio Link
        </Button>
      </div>

      {portfolioItems.length === 0 ? (
        <Card className="rounded-2xl border-0 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Portfolio Items</h3>
            <p className="text-muted-foreground mb-4">
              Add your best-performing posts to your portfolio
            </p>
            <Button variant="outline">Browse Content</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <Card 
              key={item.id} 
              className={`rounded-2xl border-0 shadow-sm backdrop-blur-sm transition-all duration-200 ${
                item.highlight 
                  ? 'bg-gradient-to-br from-primary/10 to-accent/10 ring-2 ring-primary/20' 
                  : 'bg-card/50 hover:bg-card/70'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg truncate">{item.title}</CardTitle>
                    <Badge variant="secondary" className={`mt-2 ${getPlatformColor(item.platform)}`}>
                      {item.platform}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.highlight && (
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    )}
                    <Switch
                      checked={item.highlight}
                      onCheckedChange={() => toggleHighlight(item.id, item.highlight)}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{item.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{item.engagement_rate.toFixed(2)}%</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}