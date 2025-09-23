import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQ() {
  const faqs = [
    {
      question: "How do I connect TikTok?",
      answer: "Simply click the 'Connect TikTok' button in your dashboard and authorize Growth OS to access your account data. We only access publicly available metrics and never post on your behalf."
    },
    {
      question: "What analytics do I get?",
      answer: "Growth OS provides comprehensive TikTok analytics including follower growth, engagement rates, reach metrics, best posting times, top-performing content, audience demographics, and performance trends over time."
    },
    {
      question: "Can I export a PDF report?",
      answer: "Yes! Growth OS generates shareable report links that brands can view in their browser. You can also export reports as PDFs for presentations or email attachments."
    },
    {
      question: "How do I share my analytics with brands?",
      answer: "Create a professional report link in seconds that showcases your key metrics, top posts, and growth trends. Brands can view your performance data in a clean, branded format without needing to log in."
    },
    {
      question: "Do you support Instagram/YouTube?",
      answer: "Currently, Growth OS focuses exclusively on TikTok to provide the most accurate and detailed analytics. Instagram and YouTube support are on our roadmap for 2024."
    },
    {
      question: "How often is my data updated?",
      answer: "Your TikTok data syncs automatically every 24 hours to ensure you always have the latest metrics. You can also manually refresh your data at any time from your dashboard."
    },
    {
      question: "What pricing plans do you offer?",
      answer: "We offer flexible pricing starting with a free trial, then Starter ($19/month), Pro ($49/month), and Agency ($99/month) plans. Each tier includes different features like multiple accounts, advanced analytics, and team collaboration tools."
    },
    {
      question: "How accurate is the data?",
      answer: "Our data comes directly from TikTok's official API, ensuring 100% accuracy. We sync your latest metrics every 24 hours and cross-reference multiple data points to provide the most reliable analytics available."
    },
    {
      question: "Can my team collaborate on Growth OS?",
      answer: "Yes! Pro and Agency plans include team features where you can invite team members, assign roles, and collaborate on reports. Perfect for agencies managing multiple creator accounts."
    },
    {
      question: "What if I'm just starting out as a creator?",
      answer: "Growth OS works for creators at any stage! Whether you have 100 or 100K followers, our analytics help you understand your audience, track growth, and create professional reports to attract brand partnerships."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! Get started with a 7-day free trial to explore all features. No credit card required. Experience the full power of Growth OS before committing to a subscription."
    },
    {
      question: "Do you offer API access?",
      answer: "Enterprise customers can access our API to integrate Growth OS data into their own systems. Contact our sales team to discuss custom API solutions and enterprise pricing."
    },
    {
      question: "What kind of customer support do you provide?",
      answer: "We offer email support for all users, priority support for Pro users, and dedicated account management for Agency customers. Our average response time is under 4 hours during business days."
    },
    {
      question: "How long does onboarding take?",
      answer: "Getting started is quick! Once you connect your TikTok account, we'll sync your data within minutes. Our guided onboarding tour helps you explore key features and create your first report in under 10 minutes."
    },
    {
      question: "How is my data secured?",
      answer: "We use enterprise-grade security including encrypted data storage, secure API connections, and never store your TikTok login credentials. Your data is protected and never shared with third parties."
    },
    {
      question: "Can I track multiple TikTok accounts?",
      answer: "Our Pro plan allows you to connect and track multiple TikTok accounts from one dashboard. Perfect for agencies or creators managing multiple brands."
    },
    {
      question: "What makes Growth OS different from other analytics tools?",
      answer: "Growth OS is built specifically for TikTok creators seeking brand partnerships. We focus on the metrics that matter to brands and present them in professional, shareable reports that help you win more deals."
    },
    {
      question: "Can I white-label reports for my clients?",
      answer: "Agency plan users can customize reports with their own branding, logos, and color schemes. Perfect for agencies presenting analytics to their clients under their own brand."
    },
    {
      question: "What happens if TikTok changes their API?",
      answer: "We continuously monitor TikTok's API changes and update our integration accordingly. Our engineering team ensures seamless data continuity even when TikTok updates their platform."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely! You can cancel your subscription at any time through your account settings. There are no contracts or cancellation fees. Your data remains accessible during your current billing period."
    }
  ];

  return (
    <section id="faq" className="container py-24 lg:py-32 bg-muted/20">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold lg:text-5xl">
            Frequently asked
            <span className="bg-gradient-to-r from-primary to-growth-accent bg-clip-text text-transparent">
              {" "}questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Growth OS.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4 [&[data-state=open]>svg]:rotate-180">
                <span className="font-medium">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}