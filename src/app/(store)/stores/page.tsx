import { MapPin, Navigation, Clock, Phone } from "lucide-react";

export default function StoreLocatorPage() {
    const stores = [
        {
            name: "Downtown FreshMart",
            address: "123 Market Street, Fresh City, FC 10001",
            hours: "Mon-Sun: 7am - 11pm",
            phone: "+1 (555) 123-4567",
            status: "Open Now"
        },
        {
            name: "Uptown FreshMart",
            address: "456 North Avenue, Fresh City, FC 10002",
            hours: "Mon-Sun: 8am - 10pm",
            phone: "+1 (555) 987-6543",
            status: "Open Now"
        },
        {
            name: "Westside FreshMart",
            address: "789 Boulevard Rd, Fresh City, FC 10003",
            hours: "Mon-Sat: 7am - 10pm, Sun: 8am - 9pm",
            phone: "+1 (555) 456-7890",
            status: "Closes at 10pm"
        }
    ];

    return (
        <div>
            {/* Hero */}
            <section className="relative section-gradient overflow-hidden py-12 md:py-16">
                <div className="blob blob-primary w-72 h-72 -top-20 -right-20" />
                <div className="blob blob-accent w-56 h-56 -bottom-16 -left-16" />
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">Find a <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">Store</span></h1>
                            <p className="text-muted-foreground">Find the closest FreshMart location near you for quick pickup or in-store shopping.</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 max-w-7xl py-8 flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="relative">
                        <input type="text" placeholder="Enter zip code or city..." className="w-full h-12 pl-12 pr-4 rounded-xl border border-border/50 bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all shadow-soft" />
                        <MapPin className="w-5 h-5 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[500px]">
                        {stores.map((store, i) => (
                            <div key={i} className="bg-background/70 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer group">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{store.name}</h3>
                                    <span className="text-xs font-bold text-emerald-600 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">{store.status}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">{store.address}</p>

                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        <span>{store.hours}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-4 h-4 text-emerald-500" />
                                        <span>{store.phone}</span>
                                    </div>
                                </div>

                                <button className="w-full h-10 bg-gradient-to-r from-primary to-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-all text-sm opacity-0 group-hover:opacity-100 hover:shadow-glow">
                                    Get Directions <Navigation className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Placeholder Map Area */}
                <div className="w-full lg:w-2/3 h-[400px] lg:h-auto min-h-[500px] bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-3xl border border-border/50 flex items-center justify-center relative overflow-hidden shadow-soft">
                    <div className="blob blob-primary w-40 h-40 top-10 right-10 opacity-30" />
                    <div className="blob blob-accent w-32 h-32 bottom-10 left-10 opacity-30" />
                    <div className="relative z-10 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-500 shadow-lg shadow-primary/20 rounded-2xl flex items-center justify-center text-white mb-4 animate-bounce">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <p className="font-bold text-lg">Interactive Map View</p>
                        <p className="text-sm text-muted-foreground">Map rendering component placeholder</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
