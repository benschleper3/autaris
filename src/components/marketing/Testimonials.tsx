import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      quote: "Growth OS helped me land my biggest brand deal yet. The reports show exactly why brands should work with me.",
      author: "Sarah M.",
      role: "Fashion Creator",
      followers: "250K followers"
    },
    {
      quote: "Finally, a way to prove my value without spending hours on spreadsheets. Brands love the professional reports.",
      author: "Alex Chen",
      role: "Lifestyle Creator", 
      followers: "180K followers"
    },
    {
      quote: "The best time heatmap changed my posting strategy completely. My engagement doubled in just one month.",
      author: "Maya Rodriguez",
      role: "Beauty Creator",
      followers: "320K followers"
    }
  ];

  return (
    <section id="testimonials" className="container py-24 lg:py-32 bg-muted/20">
      <div className="text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold lg:text-5xl">
            Creators are already
            <span className="bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent">
              {" "}winning bigger deals
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. See what creators are saying about Growth OS.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                
                <blockquote className="text-foreground/90 italic">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="space-y-1">
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.followers}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}