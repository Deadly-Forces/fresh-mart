import { ShieldCheck, Truck, HeadphonesIcon, RefreshCw } from "lucide-react";

export function TrustBar() {
  const features = [
    {
      icon: Truck,
      label: "Free Delivery",
      subtitle: "On orders above ₹499",
      gradient: "from-emerald-500 to-green-400",
    },
    {
      icon: ShieldCheck,
      label: "Secure Payments",
      subtitle: "100% encrypted",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      icon: RefreshCw,
      label: "Easy Returns",
      subtitle: "No questions asked",
      gradient: "from-amber-500 to-orange-400",
    },
    {
      icon: HeadphonesIcon,
      label: "24/7 Support",
      subtitle: "Always here for you",
      gradient: "from-purple-500 to-pink-400",
    },
  ];

  return (
    <div className="w-full section-gradient py-12 lg:py-14">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-background/70 backdrop-blur-sm border border-border/40 hover:border-primary/20 hover:shadow-soft transition-all duration-300"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground leading-tight">
                    {feature.label}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {feature.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
