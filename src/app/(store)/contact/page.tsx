import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <div className="relative section-gradient py-20 lg:py-24">
        <div className="blob blob-primary w-72 h-72 -top-20 -right-20 animate-pulse-soft" />
        <div className="blob blob-accent w-64 h-64 -bottom-20 -left-20 animate-pulse-soft delay-300" />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-4 px-3 py-1.5 rounded-full border border-primary/15 bg-primary/5">
              <MessageCircle className="w-3.5 h-3.5" />
              We&apos;re Here to Help
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Contact{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                Us
              </span>
            </h1>
            <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto">
              Have a question or feedback? We&apos;d love to hear from you. Get
              in touch with our team.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-bold text-2xl mb-8">Get in Touch</h2>
              <div className="space-y-5">
                {[
                  {
                    icon: MapPin,
                    title: "Store Location",
                    desc: "123 Market Street, Fresh City, FC 10001",
                    gradient: "from-emerald-500 to-green-400",
                  },
                  {
                    icon: Phone,
                    title: "Phone Number",
                    desc: "+1 (555) 123-4567",
                    gradient: "from-blue-500 to-cyan-400",
                  },
                  {
                    icon: Mail,
                    title: "Email Address",
                    desc: "hello@freshmart.com",
                    gradient: "from-amber-500 to-orange-400",
                  },
                  {
                    icon: Clock,
                    title: "Working Hours",
                    desc: "Mon – Sun: 7 AM – 11 PM",
                    gradient: "from-purple-500 to-pink-400",
                  },
                ].map((Item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-start p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-soft transition-all duration-300 group"
                  >
                    <div
                      className={`w-11 h-11 bg-gradient-to-br ${Item.gradient} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{Item.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {Item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10 rounded-[1.75rem] blur-sm" />
            <div className="relative bg-card border border-border/50 rounded-3xl p-8 shadow-aesthetic">
              <h2 className="font-bold text-2xl mb-6">Send a Message</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input
                      type="text"
                      className="w-full h-12 px-4 rounded-xl border border-border/60 bg-background/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input
                      type="text"
                      className="w-full h-12 px-4 rounded-xl border border-border/60 bg-background/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full h-12 px-4 rounded-xl border border-border/60 bg-background/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all text-sm"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="w-full p-4 rounded-xl border border-border/60 bg-background/80 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all min-h-[120px] text-sm"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button
                  type="button"
                  className="w-full h-12 bg-gradient-to-r from-primary to-emerald-500 hover:shadow-glow text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                >
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
