import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export default function Privacy() {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {today}
            </p>
          </header>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Account Information</h3>
                  <p className="text-foreground/80">
                    We collect information you provide when creating an account, including your email address, name, and profile details.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Connected Platform Data</h3>
                  <p className="text-foreground/80">
                    When you connect social media accounts, we access posts, metrics, and performance data as authorized by you through the platform's API.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Usage Data</h3>
                  <p className="text-foreground/80">
                    We automatically collect information about how you use Growth OS, including features accessed, reports generated, and system performance metrics.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Information</h2>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>Provide and maintain Growth OS services</li>
                <li>Generate analytics and performance reports</li>
                <li>Improve our platform and develop new features</li>
                <li>Communicate with you about your account and our services</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Ensure security and prevent fraudulent activity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <div className="space-y-4">
                <p className="text-foreground/80">
                  <strong>We do not sell your personal information.</strong> We may share information in these circumstances:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                  <li>With service providers who assist in operating Growth OS</li>
                  <li>When required by law or to protect our legal rights</li>
                  <li>In connection with a business transaction (merger, acquisition)</li>
                  <li>With your explicit consent</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
              <p className="text-foreground/80">
                We retain your information for as long as your account is active or as needed to provide services. You can request deletion of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Security</h2>
              <p className="text-foreground/80">
                We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Choices</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Access and Update</h3>
                  <p className="text-foreground/80">
                    You can access and update your account information through your profile settings.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Data Deletion</h3>
                  <p className="text-foreground/80">
                    You can request deletion of your account and personal data by contacting us.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Platform Connections</h3>
                  <p className="text-foreground/80">
                    You can disconnect social media integrations at any time through your account settings.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
              <p className="text-foreground/80">
                Growth OS is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p className="text-foreground/80">
                We may update this privacy policy from time to time. We will notify you of any material changes via email or through the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p className="text-foreground/80">
                Questions about this privacy policy? Contact us at:{' '}
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