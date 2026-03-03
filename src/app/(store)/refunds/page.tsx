import { RotateCcw } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative section-gradient overflow-hidden py-14 md:py-20">
        <div className="blob blob-primary w-72 h-72 -top-20 -right-20" />
        <div className="blob blob-accent w-56 h-56 -bottom-16 -left-16" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/20 mb-5">
            <RotateCcw className="w-7 h-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Refund{" "}
            <span className="bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent">
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
            <h2>1. 100% Freshness Guarantee</h2>
            <p>
              We stand by the quality of our products. If you receive an item
              that does not meet our high standards for freshness and quality,
              please contact us within 24 hours of delivery.
            </p>

            <h2>2. Eligible Returns</h2>
            <p>
              Refunds or replacements will be issued for items that are damaged,
              spoiled, or missing from your order. We may request a photo of the
              item in question to help us improve our quality control.
            </p>

            <h2>3. Refund Process</h2>
            <p>
              Once your claim is approved, a refund will be processed, and a
              credit will automatically be applied to your credit card or
              original method of payment within a certain amount of days,
              typically 3-5 business days depending on your bank.
            </p>

            <h2>4. Non-Returnable Items</h2>
            <p>
              For hygiene and safety reasons, certain items cannot be returned
              unless they arrived damaged or defective. This includes opened
              personal care items and partially consumed food products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
