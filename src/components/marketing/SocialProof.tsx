export function SocialProof() {
  const logos = [
    "Brand A",
    "Brand B", 
    "Creator Collective",
    "Studio X"
  ];

  return (
    <section id="logos" className="container py-12 lg:py-16">
      <div className="text-center space-y-8">
        <p className="text-sm text-muted-foreground">
          Trusted by creators working with top brands
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="px-6 py-3 bg-muted/20 rounded-lg border border-border/50"
            >
              <span className="text-sm font-medium text-muted-foreground">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}