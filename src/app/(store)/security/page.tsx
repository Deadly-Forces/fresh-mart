import { ShieldCheck, Lock, Eye, Server, FileCheck, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata = {
    title: "Security | Fresh Mart",
    description: "Learn about the security measures we implement to protect your data and ensure safe transactions at Fresh Mart.",
};

const securityMeasures = [
    {
        icon: Lock,
        title: "Encryption in Transit",
        description: "All data transmitted between your browser and our servers is encrypted using TLS 1.3 / HTTPS. We enforce HSTS (HTTP Strict Transport Security) to prevent downgrade attacks.",
        color: "from-blue-500 to-cyan-500",
        shadow: "shadow-blue-500/20",
    },
    {
        icon: ShieldCheck,
        title: "XSS Protection",
        description: "We sanitize all user-generated HTML content using DOMPurify before rendering, preventing cross-site scripting attacks. Our Content Security Policy headers provide an additional layer of defense.",
        color: "from-emerald-500 to-green-500",
        shadow: "shadow-emerald-500/20",
    },
    {
        icon: Server,
        title: "Server-Side Validation",
        description: "All inputs are validated server-side using Zod schemas. We never trust client-provided data — prices, totals, and quantities are verified against our database before processing orders.",
        color: "from-violet-500 to-purple-500",
        shadow: "shadow-violet-500/20",
    },
    {
        icon: Eye,
        title: "Authentication & Authorization",
        description: "We use Supabase Auth with row-level security (RLS) policies on every database table. Admin actions require both authentication and role verification at the application level.",
        color: "from-amber-500 to-orange-500",
        shadow: "shadow-amber-500/20",
    },
    {
        icon: FileCheck,
        title: "Security Headers",
        description: "Our application sets comprehensive HTTP security headers including Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy.",
        color: "from-rose-500 to-pink-500",
        shadow: "shadow-rose-500/20",
    },
    {
        icon: AlertTriangle,
        title: "Rate Limiting",
        description: "Sensitive operations like placing orders are rate-limited to prevent abuse. This protects against automated attacks and ensures fair access for all customers.",
        color: "from-teal-500 to-emerald-500",
        shadow: "shadow-teal-500/20",
    },
];

const securityPractices = [
    "All payment processing is handled by Stripe — we never store your card details",
    "User passwords are hashed using bcrypt via Supabase Auth",
    "File uploads are validated for type and size before storage",
    "Admin routes are protected at both middleware and server-action levels",
    "UUID validation prevents injection attacks through ID parameters",
    "Database queries use parameterized statements via Supabase SDK",
    "Session tokens are HTTP-only cookies with secure flags",
    "CORS policies restrict API access to authorized origins",
];

export default function SecurityPage() {
    return (
        <div>
            {/* Hero */}
            <section className="relative section-gradient overflow-hidden py-14 md:py-20">
                <div className="blob blob-primary w-72 h-72 -top-20 -left-20" />
                <div className="blob blob-accent w-56 h-56 -bottom-16 -right-16" />
                <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/20 mb-5">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        Security at{" "}
                        <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                            Fresh Mart
                        </span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Your safety is our priority. Here&apos;s how we protect your data, your transactions, and your privacy.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 max-w-5xl py-12 space-y-16">
                {/* Security Measures Grid */}
                <section>
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                        How We Protect You
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {securityMeasures.map((measure) => (
                            <div
                                key={measure.title}
                                className="rounded-2xl border border-border/50 bg-background/70 backdrop-blur-sm p-6 shadow-soft hover:shadow-md transition-shadow"
                            >
                                <div
                                    className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${measure.color} text-white ${measure.shadow} shadow-lg mb-4`}
                                >
                                    <measure.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">{measure.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{measure.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Security Practices */}
                <section className="rounded-2xl border border-border/50 bg-background/70 backdrop-blur-sm p-8 md:p-12 shadow-soft">
                    <h2 className="text-2xl md:text-3xl font-bold mb-8">
                        Our Security Practices
                    </h2>
                    <ul className="space-y-4">
                        {securityPractices.map((practice) => (
                            <li key={practice} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="text-muted-foreground">{practice}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Responsible Disclosure */}
                <section className="rounded-2xl border border-border/50 bg-background/70 backdrop-blur-sm p-8 md:p-12 shadow-soft">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Responsible Disclosure
                    </h2>
                    <div className="prose prose-slate max-w-none text-muted-foreground prose-headings:text-foreground">
                        <p>
                            We take security vulnerabilities seriously. If you discover a security issue in our application, we encourage you to report it responsibly.
                        </p>
                        <p>
                            Please contact us through our{" "}
                            <a href="/contact" className="text-primary hover:underline">contact page</a>{" "}
                            with a detailed description of the vulnerability. We will acknowledge receipt within 48 hours and work to address the issue promptly.
                        </p>
                        <p className="text-sm">
                            We kindly ask that you do not publicly disclose the vulnerability until we have had a reasonable opportunity to address it.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
