import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Opportunity {
  id: string;
  title: string;
  value_usd: number;
  stage: string;
  close_date: string;
}

const stages = [
  { id: 'new', title: 'New', color: 'bg-slate-100' },
  { id: 'qualified', title: 'Qualified', color: 'bg-blue-100' },
  { id: 'call_booked', title: 'Call Booked', color: 'bg-yellow-100' },
  { id: 'proposal', title: 'Proposal', color: 'bg-orange-100' },
  { id: 'won', title: 'Won', color: 'bg-green-100' },
  { id: 'lost', title: 'Lost', color: 'bg-red-100' }
];

export default function PipelineKanban() {
  const [opportunities, setOpportunities] = useState<Record<string, Opportunity[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const { data, error } = await supabase
          .from('crm_opportunities')
          .select('id, title, value_cents, stage, close_date')
          .order('close_date', { ascending: true });

        if (error) throw error;

        // Group by stage
        const grouped = (data || []).reduce((acc, opp) => {
          const stage = opp.stage;
          if (!acc[stage]) acc[stage] = [];
          acc[stage].push({
            ...opp,
            value_usd: opp.value_cents / 100
          });
          return acc;
        }, {} as Record<string, Opportunity[]>);

        setOpportunities(grouped);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/50 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Remove the complex drag and drop for now and just display the data */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {stages.map((stage) => (
              <div key={stage.id} className="w-72 flex-shrink-0">
                <div className={`p-3 rounded-t-lg ${stage.color}`}>
                  <h3 className="font-medium">{stage.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {opportunities[stage.id]?.length || 0} opportunities
                  </p>
                </div>
                
                <div className="bg-muted/30 rounded-b-lg p-2 min-h-64 space-y-2">
                  {(opportunities[stage.id] || []).map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-background rounded-lg p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-medium text-sm mb-2">{opp.title}</h4>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">
                          ${opp.value_usd.toLocaleString()}
                        </Badge>
                        {opp.close_date && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(opp.close_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}