import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { generateInsights } from "@/lib/insights";
import { useToast } from "@/hooks/use-toast";

export default function GenerateInsightsButton({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onClick = async () => {
    try {
      setLoading(true);
      await generateInsights();
      toast({
        title: "Insights Generated",
        description: "Your AI insights have been updated successfully."
      });
      if (onSuccess) onSuccess();
    } catch (e: any) {
      console.error("Error generating insights:", e);
      toast({
        title: "Generation Failed",
        description: e?.message || "Could not generate insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Sparkles className="w-4 h-4" />
      {loading ? "Generating..." : "Generate AI Insights"}
    </Button>
  );
}