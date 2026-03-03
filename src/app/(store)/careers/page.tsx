import { Briefcase, ArrowRight, Sparkles, MapPin, Clock } from "lucide-react";

export default function CareersPage() {
  const jobs = [
    {
      title: "Store Manager",
      location: "Downtown Branch",
      type: "Full-Time",
      gradient: "from-emerald-500 to-green-400",
    },
    {
      title: "Delivery Driver",
      location: "Multiple Locations",
      type: "Full-Time / Part-Time",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      title: "Produce Specialist",
      location: "Uptown Branch",
      type: "Full-Time",
      gradient: "from-amber-500 to-orange-400",
    },
    {
      title: "Customer Support Representative",
      location: "Remote",
      type: "Full-Time",
      gradient: "from-purple-500 to-pink-400",
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <div className="relative section-gradient py-20 lg:py-28">
        <div className="blob blob-primary w-72 h-72 -top-20 -right-20 animate-pulse-soft" />
        <div className="blob blob-accent w-64 h-64 -bottom-20 -left-20 animate-pulse-soft delay-300" />
        <div className="container mx-auto px-4 max-w-7xl relative text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-4 px-3 py-1.5 rounded-full border border-primary/15 bg-primary/5">
            <Sparkles className="w-3.5 h-3.5" />
            We&apos;re Hiring
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Join Our{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Team
            </span>
          </h1>
          <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto">
            We&apos;re always looking for passionate individuals who love fresh
            food and great customer service. Build your career with FreshMart.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-16 lg:py-20">
        <div className="grid gap-4">
          {jobs.map((job, i) => (
            <div
              key={i}
              className="group bg-card border border-border/50 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/20 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${job.gradient} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                >
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {job.type}
                    </span>
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-2 text-primary font-medium text-sm group-hover:translate-x-1 transition-transform self-start sm:self-auto mt-2 sm:mt-0">
                Apply Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10" />
          <div className="relative p-8 md:p-12 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-3 px-3 py-1.5 rounded-full border border-primary/15 bg-background/60">
              <Sparkles className="w-3.5 h-3.5" />
              Open Application
            </span>
            <h2 className="font-bold text-2xl lg:text-3xl mb-3">
              Don&apos;t see a perfect fit?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Send us your resume, and we&apos;ll keep you in mind for future
              opportunities.
            </p>
            <button className="h-12 px-8 bg-gradient-to-r from-primary to-emerald-500 text-white hover:shadow-glow rounded-xl font-medium transition-all duration-300">
              Send Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
