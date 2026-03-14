import "leaflet/dist/leaflet.css";

import { MapPin } from "lucide-react";
import { StoreLocatorClient } from "@/features/stores/components/StoreLocatorClient";
import { storeLocations } from "@/features/stores/data/stores";

export default function StoreLocatorPage() {
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
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
                Find a{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                  Store
                </span>
              </h1>
              <p className="text-muted-foreground">
                Find the closest FreshMart location near you for quick pickup or
                in-store shopping.
              </p>
            </div>
          </div>
        </div>
      </section>

      <StoreLocatorClient stores={storeLocations} />
    </div>
  );
}
