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
            <p className="text-foreground/80 mb-8">
              This Privacy Policy describes how Growth OS ("we," "us," or "our") collects, uses, and shares your information when you access or use our website, application, and related services (collectively, the "Service").
            </p>
            <p className="text-foreground/80 mb-8">
              By using Growth OS, you agree to the collection and use of information as described in this policy. If you do not agree, please discontinue use of the Service.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Account Information</h3>
                  <p className="text-foreground/80">
                    When you create an account, we collect information such as your name, email address, password, and profile details.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Connected Platform Data</h3>
                  <p className="text-foreground/80">
                    When you connect social media accounts (e.g., TikTok, Instagram, YouTube), we access posts, metrics, audience data, and performance insights as authorized by you through the platform's APIs.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Usage Data</h3>
                  <p className="text-foreground/80">
                    We automatically collect technical information about how you interact with the Service, including pages visited, features used, IP address, browser type, device identifiers, and performance logs.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Payment Information</h3>
                  <p className="text-foreground/80">
                    If you purchase a subscription, our payment processor collects billing details such as card number, billing address, and transaction history. We do not store your full payment information.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Support & Communications</h3>
                  <p className="text-foreground/80">
                    If you contact us, we collect the content of your communications and any information you provide voluntarily.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Information</h2>
              <p className="text-foreground/80 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                <li>Provide, maintain, and improve Growth OS services.</li>
                <li>Generate analytics, insights, and performance reports.</li>
                <li>Develop new features and personalize your experience.</li>
                <li>Communicate with you about your account, subscriptions, or updates.</li>
                <li>Provide customer support and respond to inquiries.</li>
                <li>Monitor usage to detect, prevent, and address fraud or security incidents.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <div className="space-y-4">
                <p className="text-foreground/80">
                  We do not sell your personal information. We may share your information in these limited circumstances:
                </p>
                <ul className="list-disc pl-6 text-foreground/80 space-y-2">
                  <li><strong>Service Providers:</strong> With trusted vendors who provide hosting, analytics, payment processing, and customer support services.</li>
                  <li><strong>Legal & Compliance:</strong> When required by law, legal process, or to protect our rights, property, or safety.</li>
                  <li><strong>Business Transactions:</strong> If we are involved in a merger, acquisition, financing, or sale of assets, your information may be transferred.</li>
                  <li><strong>With Your Consent:</strong> When you authorize us to share data with third parties (e.g., integrations or reports shared with brands).</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
              <div className="space-y-4">
                <p className="text-foreground/80">
                  We retain your information as long as your account is active or as necessary to provide our services.
                </p>
                <p className="text-foreground/80">
                  You may request deletion of your account and data at any time by contacting us.
                </p>
                <p className="text-foreground/80">
                  Some information may be retained as required by law, to resolve disputes, or to enforce agreements.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Security</h2>
              <p className="text-foreground/80">
                We implement industry-standard technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights & Choices</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Access and Update</h3>
                  <p className="text-foreground/80">
                    You can view and update your account information through your profile settings.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Data Deletion</h3>
                  <p className="text-foreground/80">
                    You may request deletion of your account and associated data by contacting us at the email below.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Platform Connections</h3>
                  <p className="text-foreground/80">
                    You may disconnect social media integrations at any time through your account settings.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Marketing Preferences</h3>
                  <p className="text-foreground/80">
                    You may opt out of promotional emails by following the unsubscribe link.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Legal Rights</h3>
                  <p className="text-foreground/80">
                    Depending on your jurisdiction, you may have additional rights (e.g., GDPR: right to access, rectify, erase, restrict processing, and data portability; CCPA: right to know, delete, and opt out of sale). To exercise these rights, contact us at the email below.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
              <p className="text-foreground/80">
                Growth OS is not directed to children under 13 (or the minimum age required by local law). We do not knowingly collect personal information from children. If we learn that we have collected such information, we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
              <p className="text-foreground/80">
                If you access the Service from outside the United States, your information may be transferred to, stored, and processed in the United States or other countries where we operate. We take steps to ensure appropriate safeguards are in place consistent with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
              <p className="text-foreground/80">
                We may update this Privacy Policy from time to time. If we make material changes, we will notify you via email or through the Service prior to the change taking effect. The updated policy will be effective when posted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
              <p className="text-foreground/80">
                If you have any questions or requests regarding this Privacy Policy, please contact us at:{' '}
                <a href="mailto:hello@growthos.ai" className="text-primary hover:underline">
                  📧 hello@growthos.ai
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