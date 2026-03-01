import { HelpCircle, MessageSquare } from "lucide-react";

export default function FAQPage() {
    const faqs = [
        {
            q: "Do you offer same-day delivery?",
            a: "Yes! Orders placed before 4 PM are eligible for same-day delivery within our service areas."
        },
        {
            q: "What is your return policy for fresh produce?",
            a: "We have a 100% freshness guarantee. If you are not satisfied with the quality of our produce, let us know within 24 hours for a full refund or replacement."
        },
        {
            q: "Is there a minimum order amount for free delivery?",
            a: "Free delivery applies to all orders over $50. For orders under $50, a standard delivery fee of $5.99 applies."
        },
        {
            q: "How can I track my order?",
            a: "Once your order is dispatched, you will receive a tracking link via email and SMS showing the real-time location of your delivery driver."
        },
        {
            q: "Can I modify my order after placing it?",
            a: "You can modify your order up to 2 hours before your scheduled delivery window. Please contact customer support for assistance."
        }
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero */}
            <div className="relative section-gradient py-20 lg:py-24">
                <div className="blob blob-primary w-72 h-72 -top-20 -right-20 animate-pulse-soft" />
                <div className="blob blob-accent w-64 h-64 -bottom-20 -left-20 animate-pulse-soft delay-300" />
                <div className="container mx-auto px-4 max-w-7xl relative text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-sm">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                        Frequently Asked <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Questions</span>
                    </h1>
                    <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto">
                        Find answers to common questions about our services.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl py-16 lg:py-20">
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="group bg-card border border-border/50 rounded-2xl p-6 sm:p-8 hover:border-primary/20 hover:shadow-soft transition-all duration-300">
                            <h3 className="font-bold text-lg mb-3 flex items-start gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                                    <MessageSquare className="w-4 h-4" />
                                </span>
                                {faq.q}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed pl-11">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-14 text-center p-8 rounded-3xl bg-gradient-to-r from-primary/5 via-emerald-500/5 to-teal-500/5 border border-primary/10">
                    <h3 className="font-bold text-xl mb-2">Still have questions?</h3>
                    <p className="text-muted-foreground mb-5">Our support team is happy to help you with anything.</p>
                    <a href="/contact" className="inline-flex h-11 px-6 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white font-medium hover:shadow-glow transition-all duration-300 text-sm">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
