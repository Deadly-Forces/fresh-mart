import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative section-gradient overflow-hidden py-14 md:py-20">
        <div className="blob blob-primary w-72 h-72 -top-20 -left-20" />
        <div className="blob blob-accent w-56 h-56 -bottom-16 -right-16" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/20 mb-5">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Privacy{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="text-muted-foreground">
            Last updated: October 24, 2023
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl py-12">
        <div className="rounded-2xl border border-border/50 bg-background/70 backdrop-blur-sm p-8 md:p-12 shadow-soft">
          <div className="prose prose-slate max-w-none text-muted-foreground prose-headings:text-foreground prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information from you when you register on our site,
              place an order, subscribe to our newsletter, respond to a survey,
              or fill out a form. This includes your name, email address,
              mailing address, phone number, and payment information.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              Any of the information we collect from you may be used to
              personalize your experience, improve our website, improve customer
              service, process transactions, or send periodic emails regarding
              your order or other products and services.
            </p>

            <h2>3. Security</h2>
            <p>
              We implement a variety of security measures to maintain the safety
              of your personal information. Your personal data is contained
              behind secured networks and is only accessible by a limited number
              of persons who have special access rights.
            </p>

            <h2>4. Third-Party Disclosure</h2>
            <p>
              We do not sell, trade, or otherwise transfer to outside parties
              your Personally Identifiable Information unless we provide users
              with advance notice. This does not include website hosting
              partners and other parties who assist us in operating our website
              or conducting our business.
            </p>

            <h2>5. Contact Us</h2>
            <p>
              If there are any questions regarding this privacy policy, you may
              contact us through our <a href="/contact">contact page</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
