import { Heart } from 'lucide-react';

export function SocialImpact() {
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
                🌍 With every subscription to Autaris, a percentage of your plan goes directly toward building the <strong>Autaris Foundation</strong> — dedicated to helping dogs in need. By joining us, you're not only empowering creators, you're also making an impact on the lives of countless dogs waiting for care, shelter, and a second chance.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're on a mission to launch the Autaris Foundation with an initial fund of <strong>$20,000</strong>. Every subscription brings us closer to this milestone. Once we reach it, we'll officially begin funding projects that provide food, shelter, and medical care for dogs in need. Join us in building a future where every dog gets a second chance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
