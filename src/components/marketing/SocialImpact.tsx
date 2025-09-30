import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface FoundationData {
  total_raised_cents: number;
  goal_cents: number;
  contributors: number;
}

export function SocialImpact() {
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

  const progressPercent = data ? Math.round((data.total_raised_cents / data.goal_cents) * 100) : 0;

  return (
    <section id="social-impact" className="container py-24 lg:py-32">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-autaris-accent/10 border border-primary/20 p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary to-autaris-accent flex items-center justify-center">
                <Heart className="w-10 h-10 lg:w-12 lg:h-12 text-white fill-white" />
              </div>
            </div>
            
            <div className="flex-1 text-center lg:text-left space-y-4">
              <h2 className="text-3xl font-bold lg:text-4xl">
                Empowering Creators,{' '}
                <span className="bg-gradient-to-r from-primary to-autaris-accent bg-clip-text text-transparent">
                  Helping Dogs
                </span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                🌍 With every subscription to Autaris, <strong>20%</strong> of your plan goes directly toward building the <strong>Autaris Foundation</strong> — dedicated to helping dogs in need. By joining us, you're not only empowering creators, you're also making an impact on the lives of countless dogs waiting for care, shelter, and a second chance.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're on a mission to launch the Autaris Foundation with an initial fund of <strong>$20,000</strong>. Every subscription brings us closer to this milestone. Once we reach it, we'll officially begin funding projects that provide food, shelter, and medical care for dogs in need. Join us in building a future where every dog gets a second chance.
              </p>

              {loading ? (
                <div className="flex justify-center lg:justify-start pt-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : data && (
                <div className="pt-4 space-y-3">
                  <p className="text-xl font-semibold">
                    {formatCurrency(data.total_raised_cents)} raised of $20,000 ({progressPercent}%)
                  </p>
                  
                  <Progress value={progressPercent} className="h-3" />
                  
                  <p className="text-sm text-muted-foreground">
                    {data.contributors} {data.contributors === 1 ? 'contributor' : 'contributors'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
