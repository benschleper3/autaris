import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Users, Video, TrendingUp } from 'lucide-react';
import { toast } from './ui/use-toast';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose whether you're a Creator or UGC Creator",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Upsert into user_meta table
      const { error } = await supabase
        .from('user_meta')
        .upsert({ 
          user_id: user.id,
          role: selectedRole as 'creator' | 'ugc_creator'
        });

      if (error) throw error;

      toast({
        title: "Welcome aboard!",
        description: `You're all set up as a ${selectedRole === 'creator' ? 'Creator' : 'UGC Creator'}`,
      });

      onComplete();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80 p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-growth-primary to-growth-secondary bg-clip-text text-transparent">
            Welcome to Growth OS
          </h1>
          <p className="text-muted-foreground">
            Choose your role to customize your dashboard
          </p>
        </div>

        <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 hover:bg-card/50 cursor-pointer">
              <RadioGroupItem value="creator" id="creator" />
              <Label htmlFor="creator" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-growth-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-growth-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Creator</div>
                    <div className="text-sm text-muted-foreground">
                      Turn content into leads, calls, and clients
                    </div>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 hover:bg-card/50 cursor-pointer">
              <RadioGroupItem value="ugc_creator" id="ugc_creator" />
              <Label htmlFor="ugc_creator" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-growth-secondary/10 flex items-center justify-center">
                    <Video className="w-4 h-4 text-growth-secondary" />
                  </div>
                  <div>
                    <div className="font-medium">UGC Creator</div>
                    <div className="text-sm text-muted-foreground">
                      Manage brand campaigns and track revenue
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>

        <Button 
          onClick={handleRoleSelection}
          disabled={!selectedRole || loading}
          className="w-full"
        >
          {loading ? 'Setting up...' : 'Get Started'}
        </Button>
      </Card>
    </div>
  );
}