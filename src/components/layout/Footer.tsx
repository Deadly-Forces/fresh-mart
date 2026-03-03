import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  Leaf,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Newsletter */}
      <div className="relative border-b border-border/30">
        <div className="container mx-auto px-4 max-w-7xl py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-3xl bg-gradient-to-r from-primary/5 via-emerald-500/5 to-teal-500/5 border border-primary/10">
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-2">
                <Send className="w-3.5 h-3.5" />
                Newsletter
              </span>
              <h3 className="text-xl font-bold text-foreground mb-1">
                Stay in the loop
              </h3>
              <p className="text-sm text-muted-foreground">
                Fresh deals and new arrivals straight to your inbox.
              </p>
            </div>
            <div className="flex w-full md:w-auto max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-5 rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              <button className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white text-sm font-semibold hover:shadow-glow transition-all duration-300 shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="relative container mx-auto px-4 max-w-7xl py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4 group cursor-default">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300">
                <Leaf className="w-5 h-5 fill-white/20" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-foreground tracking-tight text-lg">
                FreshMart
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              Your destination for fresh groceries and daily essentials,
              delivered to your doorstep.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Youtube, href: "#", label: "Youtube" },
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { name: "Vegetables", slug: "vegetables" },
                { name: "Fruits", slug: "fruits" },
                { name: "Dairy & Eggs", slug: "dairy-eggs" },
                { name: "Bakery", slug: "bakery" },
                { name: "Meat & Seafood", slug: "meat-seafood" },
                { name: "Beverages", slug: "beverages" },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Careers", href: "/careers" },
                { label: "Blog", href: "/blog" },
                { label: "FAQ", href: "/faq" },
                { label: "Stores", href: "/stores" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { label: "Terms of Service", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Refund Policy", href: "/refunds" },
                { label: "Shipping", href: "/shipping" },
                { label: "Cookies", href: "/cookies" },
                { label: "Security", href: "/security" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-border/30">
        <div className="container mx-auto px-4 max-w-7xl py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} FreshMart. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Visa", "Mastercard", "Amex", "PayPal"].map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 rounded-md bg-secondary/60 text-[11px] font-medium uppercase tracking-wider"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
