import { Navbar } from '@/components/marketing/Navbar';
import { Features } from '@/components/marketing/Features';
import { Footer } from '@/components/marketing/Footer';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navbar />
      <main>
        <Features />
      </main>
      <Footer />
    </div>
  );
}