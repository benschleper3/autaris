import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface FoundationData {
  total_raised_cents: number;
  goal_cents: number;
  contributors: number;
}

export function FoundationLaunch() {
  const [data, setData] = useState<FoundationData | null>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const fetchData = async () => {
    const { data: fundData, error } = await supabase
      .from('foundation_fund')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching foundation data:', error);
      return;
    }

    if (fundData) {
      setData(fundData);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('foundation-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'foundation_fund'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <section className="container py-12 lg:py-16">
        <div className="max-w-3xl mx-auto flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!data) return null;

  const progressPercent = Math.round((data.total_raised_cents / data.goal_cents) * 100);

  return (
    <section className="container py-12 lg:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-3xl font-bold lg:text-4xl">
            Launching the Autaris Foundation
          </h2>
          <p className="text-lg text-muted-foreground">
            A % of every Autaris subscription helps us reach $20,000 to kickstart food, shelter, and medical care for dogs in need.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 lg:p-10 shadow-lg space-y-6">
          <div className="space-y-3">
            <p className="text-2xl font-semibold text-center">
              {formatCurrency(data.total_raised_cents)} raised of $20,000 ({progressPercent}%)
            </p>
            
            <Progress value={progressPercent} className="h-4" />
            
            <p className="text-sm text-muted-foreground text-center">
              {data.contributors} {data.contributors === 1 ? 'contributor' : 'contributors'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
