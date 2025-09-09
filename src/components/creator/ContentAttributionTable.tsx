import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface AttributionData {
  title: string;
  platform: string;
  published_at: string;
  leads_count: number;
  revenue_usd: number;
  views: number;
  engagement_rate: number;
}

export default function ContentAttributionTable() {
  const [data, setData] = useState<AttributionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttributionData = async () => {
      try {
        const { data: attributionData, error } = await supabase
          .from('post_metrics')
          .select(`
            title,
            views,
            engagement_rate,
            post_id,
            published_at,
            created_at,
            social_accounts!inner(platform)
          `)
          .gte('coalesce(published_at, created_at)', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('views', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        // Transform the data to match expected interface
        const transformedData = (attributionData || []).map(item => ({
          title: item.title || 'Untitled',
          platform: item.social_accounts?.platform || 'Unknown',
          published_at: item.published_at || item.created_at,
          leads_count: 0, // TODO: Calculate from attribution
          revenue_usd: 0, // TODO: Calculate from attribution  
          views: item.views || 0,
          engagement_rate: item.engagement_rate || 0
        }));
        
        setData(transformedData);
      } catch (error) {
        console.error('Error fetching content attribution:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttributionData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content → Client Attribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
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
          <ExternalLink className="w-5 h-5" />
          Content → Client Attribution (30d)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>ER%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No content attribution data available yet
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium truncate max-w-48">{item.title}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.published_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.leads_count}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-growth-success">
                      ${item.revenue_usd.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>{item.views?.toLocaleString()}</TableCell>
                  <TableCell>{item.engagement_rate}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}