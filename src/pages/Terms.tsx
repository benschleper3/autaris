import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export default function Terms() {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: {today}
            </p>
          </header>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Accounts & Access</h2>
              <p className="text-foreground/80 mb-4">
                You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials and all activities under your account.
              </p>
              <p className="text-foreground/80">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Acceptable Use</h2>
              <p className="text-foreground/80 mb-4">
                You may not use Growth OS to:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Distribute malware or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the service for spam or unsolicited communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Subscriptions & Billing</h2>
              <p className="text-foreground/80 mb-4">
                Subscription fees are billed in advance on a recurring basis. You can cancel your subscription at any time through your account settings.
              </p>
              <p className="text-foreground/80">
                Refunds are available within 30 days of purchase for annual subscriptions, subject to our refund policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data & Privacy</h2>
              <p className="text-foreground/80">
                Your privacy is important to us. Please review our Privacy Policy for detailed information about how we collect, use, and protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Platforms</h2>
              <p className="text-foreground/80">
                Growth OS integrates with social media platforms like TikTok. You are responsible for complying with their terms of service and maintaining valid authorization for data access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="text-foreground/80">
                Growth OS and its content are protected by copyright and other intellectual property laws. You retain ownership of your content but grant us necessary licenses to provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Disclaimer & Limitation of Liability</h2>
              <p className="text-foreground/80">
                Growth OS is provided "as is" without warranties. We are not liable for indirect, incidental, or consequential damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
              <p className="text-foreground/80">
                Either party may terminate these terms at any time. Upon termination, your access to Growth OS will cease, but these terms will survive as necessary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Changes</h2>
              <p className="text-foreground/80">
                We may update these terms from time to time. We will notify you of material changes via email or through the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
              <p className="text-foreground/80">
                Questions about these terms? Contact us at:{' '}
                <a href="mailto:hello@growthos.ai" className="text-primary hover:underline">
                  hello@growthos.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}