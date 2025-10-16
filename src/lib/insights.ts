import { supabase } from '@/integrations/supabase/client';

export async function generateInsights(options?: { from?: string; to?: string; platform?: string }) {
  const { data, error } = await supabase.functions.invoke('insights-generate', {
    body: options || {}
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate insights');
  }

  return data;
}