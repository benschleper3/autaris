import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQ() {
  const faqs = [
    {
      question: "How do I connect TikTok?",
      answer: "Simply click the 'Connect TikTok' button in your dashboard and authorize Growth OS to access your account data. We only access publicly available metrics and never post on your behalf."
    },
    {
      question: "Can I export a PDF report?",
      answer: "Yes! Growth OS generates shareable report links that brands can view in their browser. You can also export reports as PDFs for presentations or email attachments."
    },
    {
      question: "Do you support Instagram/YouTube?",
      answer: "Currently, Growth OS focuses exclusively on TikTok to provide the most accurate and detailed analytics. Instagram and YouTube support are on our roadmap for 2024."
    },
    {
      question: "How is my data secured?",
      answer: "We use enterprise-grade security including encrypted data storage, secure API connections, and never store your TikTok login credentials. Your data is protected and never shared with third parties."
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
              <AccordionTrigger className="text-left hover:no-underline py-4">
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