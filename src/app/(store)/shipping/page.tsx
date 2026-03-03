import { Truck } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative section-gradient overflow-hidden py-14 md:py-20">
        <div className="blob blob-primary w-72 h-72 -top-20 -right-20" />
        <div className="blob blob-accent w-56 h-56 -bottom-16 -left-16" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 mb-5">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Shipping &{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Delivery
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
            <h2>1. Delivery Areas</h2>
            <p>
              We currently deliver within a 20-mile radius of all our physical
              store locations. You can check if we deliver to your address by
              entering your zip code on our{" "}
              <a href="/stores">store locator page</a>.
            </p>

            <h2>2. Delivery Fees</h2>
            <p>
              Orders over ₹499 qualify for free standard delivery. For orders
              under ₹499, a flat delivery fee of ₹49 applies. Express 1-hour
              delivery is available for an additional premium in select areas.
            </p>

            <h2>3. Delivery Windows</h2>
            <p>
              During checkout, you can select a 2-hour delivery window that is
              most convenient for you. Our standard delivery hours are from 8 AM
              to 10 PM, seven days a week.
            </p>

            <h2>4. What to Expect on Delivery</h2>
            <p>
              Our drivers will text or call you when they are arriving. For
              contactless delivery, you can specify instructions during checkout
              to have groceries left at your door. Please ensure someone is
              available to receive perishable items to maintain freshness.
            </p>

            <h2>5. Missing or Damaged Items</h2>
            <p>
              Please review your order upon receipt. If anything is missing or
              damaged during transit, please contact our support team
              immediately so we can make it right.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
