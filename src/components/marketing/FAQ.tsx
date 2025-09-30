import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQ() {
  const faqs = [
    {
      question: "How do I connect TikTok?",
      answer: "Simply click the 'Connect TikTok' button in your dashboard and authorize Autaris to access your account data. We only access publicly available metrics and never post on your behalf."
    },
    {
      question: "What analytics do I get?",
      answer: "Autaris provides comprehensive TikTok analytics including follower growth, engagement rates, reach metrics, best posting times, top-performing content, audience demographics, and performance trends over time."
    },
    {
      question: "Can I export a PDF report?",
      answer: "Yes! Autaris generates shareable report links that brands can view in their browser. You can also export reports as PDFs for presentations or email attachments."
    },
    {
      question: "How do I share my analytics with brands?",
      answer: "Create a professional report link in seconds that showcases your key metrics, top posts, and growth trends. Brands can view your performance data in a clean, branded format without needing to log in."
    },
    {
      question: "Do you support Instagram/YouTube?",
      answer: "Currently, Autaris focuses exclusively on TikTok to provide the most accurate and detailed analytics. Instagram and YouTube support are on our roadmap for 2024."
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
      question: "Can my team collaborate on Autaris?",
      answer: "Yes! Pro and Agency plans include team features where you can invite team members, assign roles, and collaborate on reports. Perfect for agencies managing multiple creator accounts."
    },
    {
      question: "What if I'm just starting out as a creator?",
      answer: "Autaris works for creators at any stage! Whether you have 100 or 100K followers, our analytics help you understand your audience, track growth, and create professional reports to attract brand partnerships."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! Get started with a 7-day free trial to explore all features. No credit card required. Experience the full power of Autaris before committing to a subscription."
    },
    {
      question: "Do you offer API access?",
      answer: "Enterprise customers can access our API to integrate Autaris data into their own systems. Contact our sales team to discuss custom API solutions and enterprise pricing."
    },
    {
      question: "How secure is my data?",
      answer: "We take security seriously. All data is encrypted in transit and at rest, we never store your TikTok credentials, and we only request read-only access to your account. We're SOC 2 compliant and follow industry best practices."
    },
    {
      question: "Can I track multiple TikTok accounts?",
      answer: "Yes! Pro and Agency plans support multiple account tracking. Switch between accounts seamlessly and compare performance across all your creator profiles from a single dashboard."
    },
    {
      question: "What makes Autaris different from other analytics tools?",
      answer: "Autaris is built specifically for TikTok creators seeking brand partnerships. We focus on the metrics that matter to brands and present them in professional, shareable reports that help you win more deals."
    }
  ];

  return (
    <section id="faq" className="container py-24 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-autaris-accent bg-clip-text text-transparent">
              Frequently Asked
            </span>
            <br />
            Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Autaris.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border/50 rounded-lg px-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
            >
              <AccordionTrigger className="text-left hover:no-underline py-5">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
