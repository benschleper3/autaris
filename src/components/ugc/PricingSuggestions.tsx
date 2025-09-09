import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp } from 'lucide-react';

interface PricingSuggestion {
  platform: string;
  avg_views_30d: number;
  suggested_cpm_usd: number;
  suggested_rate_usd: number;
}

export default function PricingSuggestions() {
  const [suggestions, setSuggestions] = useState<PricingSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricingSuggestions = async () => {
      try {
        const { data, error } = await supabase
          .from('v_pricing_suggestions')
          .select('*');

        if (error) throw error;
        
        // Calculate suggested rate
        const withRates = (data || []).map(item => ({
          ...item,
          suggested_rate_usd: Math.round((item.avg_views_30d / 1000) * item.suggested_cpm_usd)
        }));
        
        setSuggestions(withRates);
      } catch (error) {
        console.error('Error fetching pricing suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingSuggestions();
  }, []);

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-100 text-pink-800';
      case 'tiktok': return 'bg-black text-white';
      case 'youtube': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pricing Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Pricing Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pricing data available</p>
              <p className="text-sm">Create content to get personalized pricing suggestions</p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`capitalize ${getPlatformColor(suggestion.platform)}`}>
                    {suggestion.platform}
                  </Badge>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ${suggestion.suggested_rate_usd}
                    </p>
                    <p className="text-xs text-muted-foreground">Suggested rate</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Avg Views (30d)</p>
                    <p className="font-medium">{suggestion.avg_views_30d.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CPM Rate</p>
                    <p className="font-medium">${suggestion.suggested_cpm_usd}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>Based on your recent performance</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}