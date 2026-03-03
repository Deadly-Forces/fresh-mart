"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  Leaf,
  Award,
  Users,
  ShieldCheck,
  Heart,
  TrendingUp,
} from "lucide-react";

/* ── Lightweight fade-in hook (replaces framer-motion) ── */
function useFadeIn<T extends HTMLElement>(delay = 0): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return ref;
}

export default function AboutPage() {
  const heroRef = useFadeIn<HTMLDivElement>();
  const statsRef = useFadeIn<HTMLDivElement>(0.1);
  const storyRef = useFadeIn<HTMLDivElement>(0.1);
  const featureRefs = [
    useFadeIn<HTMLDivElement>(0),
    useFadeIn<HTMLDivElement>(0.1),
    useFadeIn<HTMLDivElement>(0.2),
    useFadeIn<HTMLDivElement>(0.3),
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative section-gradient py-20 lg:py-28">
        <div className="blob blob-primary w-72 h-72 -top-20 -right-20 animate-pulse-soft" />
        <div className="blob blob-accent w-64 h-64 -bottom-20 -left-20 animate-pulse-soft delay-300" />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div ref={heroRef} className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-4 px-3 py-1.5 rounded-full border border-primary/15 bg-primary/5">
              <Heart className="w-3.5 h-3.5" />
              Our Mission
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                FreshMart
              </span>
            </h1>
            <p className="text-muted-foreground text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
              Fresh groceries delivered to your door. Quality you can trust,
              prices you&apos;ll love.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-16 lg:py-20">
        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-16 lg:mb-20"
        >
          {[
            { value: "50K+", label: "Happy Customers" },
            { value: "200+", label: "Local Farms" },
            { value: "5K+", label: "Products" },
            { value: "98%", label: "Satisfaction Rate" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/10"
            >
              <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 lg:mb-20">
          {[
            {
              icon: Leaf,
              title: "Fresh Produce",
              desc: "Sourced locally every morning",
              gradient: "from-emerald-500 to-green-400",
            },
            {
              icon: Users,
              title: "Community First",
              desc: "Supporting local farmers",
              gradient: "from-blue-500 to-cyan-400",
            },
            {
              icon: Award,
              title: "Premium Quality",
              desc: "Hand-picked for perfection",
              gradient: "from-amber-500 to-orange-400",
            },
            {
              icon: ShieldCheck,
              title: "100% Secure",
              desc: "Safe handled and delivered",
              gradient: "from-purple-500 to-pink-400",
            },
          ].map((Feature, i) => (
            <div
              ref={featureRefs[i]}
              key={i}
              className="card-aesthetic bg-card border rounded-2xl p-6 text-center"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${Feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-sm group-hover:scale-110 transition-transform`}
              >
                <Feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{Feature.title}</h3>
              <p className="text-muted-foreground text-sm">{Feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div ref={storyRef} className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10" />
          <div className="relative p-8 md:p-14 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-4 px-3 py-1.5 rounded-full border border-primary/15 bg-background/60">
              <TrendingUp className="w-3.5 h-3.5" />
              Since 2019
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-5">Our Story</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg">
              Founded with the belief that everyone deserves access to fresh,
              healthy food. We carefully select each item so only the best
              reaches your table. From a single store to serving thousands of
              homes, our journey has been fueled by community trust and an
              unwavering commitment to quality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
