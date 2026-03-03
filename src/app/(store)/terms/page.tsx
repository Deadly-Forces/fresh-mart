import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative section-gradient overflow-hidden py-14 md:py-20">
        <div className="blob blob-primary w-72 h-72 -top-20 -right-20" />
        <div className="blob blob-accent w-56 h-56 -bottom-16 -left-16" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 mb-5">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Terms of{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Service
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
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using FreshMart's website and services, you
              accept and agree to be bound by the terms and provision of this
              agreement.
            </p>

            <h2>2. User Accounts</h2>
            <p>
              When you create an account with us, you must provide us
              information that is accurate, complete, and current at all times.
              Failure to do so constitutes a breach of the Terms, which may
              result in immediate termination of your account on our Service.
            </p>

            <h2>3. Products and Pricing</h2>
            <p>
              All products listed on the website, their descriptions, and their
              prices are subject to change. FreshMart reserves the right to
              modify, suspend, or discontinue the sale of any product at any
              time without notice.
            </p>

            <h2>4. Delivery Information</h2>
            <p>
              Delivery times are estimates and cannot be guaranteed. We are
              varying our best to ensure timely delivery, but delays may occur
              due to traffic, weather conditions, or unforeseen circumstances.
            </p>

            <h2>5. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. What constitutes a material change will
              be determined at our sole discretion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
