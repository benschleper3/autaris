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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-autaris-accent bg-clip-text text-transparent mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: September 19, 2025
            </p>
          </header>

          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-foreground/80 mb-8">
              These Terms of Service ("Terms") govern your access to and use of the Autaris website, application, and related services (collectively, the "Service"). Please read them carefully before using the Service.
            </p>
            
            <p className="text-foreground/80 mb-8">
              By creating an account or otherwise using Autaris, you agree to be bound by these Terms and our{' '}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              . If you do not agree, do not use the Service.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Accounts & Access</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>You must provide accurate, current, and complete information when creating an account.</li>
                <li>You are responsible for safeguarding your account credentials and for all activities that occur under your account.</li>
                <li>You must be at least 18 years old or have the consent of a parent or guardian to use the Service.</li>
                <li>We reserve the right to suspend or terminate your account if you violate these Terms, our policies, or engage in fraudulent, abusive, or unlawful activity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Acceptable Use</h2>
              <p className="text-foreground/80 mb-4">
                You agree not to use Autaris to:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>Violate any applicable laws, regulations, or third-party rights.</li>
                <li>Infringe or misappropriate intellectual property or other proprietary rights.</li>
                <li>Upload or distribute malware, viruses, or harmful content.</li>
                <li>Attempt to gain unauthorized access to our systems, networks, or user data.</li>
                <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                <li>Engage in spamming, unsolicited communications, or manipulative data scraping.</li>
              </ul>
              <p className="text-foreground/80 mt-4">
                We may investigate and take action against violations, including suspension or termination of access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Subscriptions & Billing</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>Certain features require a paid subscription. Subscription fees are billed in advance on a recurring basis (monthly or annually, as selected).</li>
                <li>You may cancel your subscription at any time through your account settings; cancellations take effect at the end of the current billing cycle.</li>
                <li>Refunds are available only as described in our refund policy. Annual subscriptions may be eligible for a refund if cancelled within 30 days of purchase.</li>
                <li>You authorize us (or our payment processors) to charge your chosen payment method for all applicable fees and taxes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data & Privacy</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>Your privacy is important to us. Please review our{' '}
                  <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                  , which explains how we collect, use, and protect your information.</li>
                <li>By using the Service, you consent to the collection and use of your data as described in our Privacy Policy.</li>
                <li>You are responsible for maintaining any required rights or consents when you provide us with personal data of others.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Platforms</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>Autaris integrates with third-party platforms (e.g., TikTok, Instagram, YouTube).</li>
                <li>Use of these integrations is subject to the respective platforms' terms of service and policies.</li>
                <li>You are solely responsible for maintaining valid accounts, authorizations, and compliance with third-party requirements.</li>
                <li>We are not responsible for interruptions, changes, or restrictions imposed by third-party platforms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>Autaris, its software, design, trademarks, and content are owned by Autaris (or its licensors) and are protected by copyright, trademark, and other intellectual property laws.</li>
                <li>You retain ownership of your content but grant us a worldwide, non-exclusive, royalty-free license to store, display, and process your content as necessary to provide the Service.</li>
                <li>You may not copy, modify, distribute, or create derivative works of Autaris except as expressly permitted.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>We aim to provide a reliable Service but do not guarantee uninterrupted or error-free operation.</li>
                <li>Maintenance, updates, or technical issues may temporarily affect availability.</li>
                <li>We may modify or discontinue features at our discretion.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</li>
                <li>We do not warrant that the Service will be secure, error-free, or meet your requirements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-foreground/80 mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>Autaris and its affiliates, directors, employees, and agents shall not be liable for indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, or data.</li>
                <li>Our total liability for any claims arising from the Service shall not exceed the amount you paid to us in the 12 months preceding the claim.</li>
                <li>Some jurisdictions do not allow limitations of liability; in such cases, our liability will be limited to the maximum extent allowed by law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
              <p className="text-foreground/80 mb-4">
                You agree to indemnify and hold harmless Autaris, its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or related to:
              </p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>Your use of the Service,</li>
                <li>Your violation of these Terms, or</li>
                <li>Your violation of any rights of another party.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>You may stop using the Service at any time.</li>
                <li>We may suspend or terminate your access at any time, with or without notice, for conduct that violates these Terms or is harmful to other users, us, or third parties.</li>
                <li>Upon termination, your right to access the Service ends immediately, but provisions relating to intellectual property, limitation of liability, indemnification, and dispute resolution will survive.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law & Dispute Resolution</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of laws principles.</li>
                <li>Any disputes shall be resolved exclusively in the state or federal courts located in Delaware.</li>
                <li>You and Autaris agree to submit to the personal jurisdiction of these courts.</li>
                <li>Where required by law, you may have additional rights in your jurisdiction.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>We may update these Terms from time to time. If changes are material, we will notify you by email or through the Service prior to the changes taking effect. The updated Terms will be effective when posted.</li>
                <li>Continued use of the Service constitutes acceptance of the revised Terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Contact</h2>
              <p className="text-foreground/80">
                For questions or concerns about these Terms, please contact us at:{' '}
                <a href="mailto:BenSchleper8@gmail.com" className="text-primary hover:underline">
                  BenSchleper8@gmail.com
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