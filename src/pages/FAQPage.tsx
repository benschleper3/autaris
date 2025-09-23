import { Navbar } from '@/components/marketing/Navbar';
import { FAQ } from '@/components/marketing/FAQ';
import { Footer } from '@/components/marketing/Footer';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navbar />
      <main>
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}