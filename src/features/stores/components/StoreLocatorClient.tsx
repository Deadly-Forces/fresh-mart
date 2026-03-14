"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Clock,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  Sparkles,
} from "lucide-react";
import type { StoreLocation } from "@/features/stores/data/stores";

const StoreLocatorMap = dynamic(
  () =>
    import("@/features/stores/components/StoreLocatorMap").then(
      (mod) => mod.StoreLocatorMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[500px] w-full animate-pulse rounded-3xl bg-secondary/40" />
    ),
  },
);

interface Coordinates {
  lat: number;
  lng: number;
}

function haversineDistance(a: Coordinates, b: Coordinates) {
  const earthRadiusKm = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

export function StoreLocatorClient({ stores }: { stores: StoreLocation[] }) {
  const [query, setQuery] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id ?? "");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchedStores = normalizedQuery
      ? stores.filter((store) =>
          [store.name, store.address, store.city, store.postalCode]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : stores;

    if (!userLocation) {
      return matchedStores;
    }

    return [...matchedStores].sort((left, right) => {
      const leftDistance = haversineDistance(userLocation, {
        lat: left.lat,
        lng: left.lng,
      });
      const rightDistance = haversineDistance(userLocation, {
        lat: right.lat,
        lng: right.lng,
      });
      return leftDistance - rightDistance;
    });
  }, [query, stores, userLocation]);

  const selectedStore =
    filteredStores.find((store) => store.id === selectedStoreId) ??
    filteredStores[0] ??
    stores[0];

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8 flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter zip code, city, or neighborhood..."
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-border/50 bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all shadow-soft"
            />
          </div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-60"
          >
            <LocateFixed className="w-4 h-4" />
            {isLocating ? "Locating..." : "Use my location"}
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[500px]">
          {filteredStores.map((store) => {
            const distance =
              userLocation &&
              haversineDistance(userLocation, {
                lat: store.lat,
                lng: store.lng,
              });
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;

            return (
              <div
                key={store.id}
                className={`bg-background/70 backdrop-blur-sm border rounded-2xl p-5 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer group ${
                  selectedStore?.id === store.id
                    ? "border-primary/40 shadow-card-hover"
                    : "border-border/50"
                }`}
                onClick={() => setSelectedStoreId(store.id)}
              >
                <div className="flex items-start justify-between mb-2 gap-3">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {store.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {store.city} {store.postalCode}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {store.statusLabel}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {store.address}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span>{store.phone}</span>
                  </div>
                  {distance ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{distance.toFixed(1)} km away</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {store.services.map((service) => (
                    <span
                      key={service}
                      className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 h-10 bg-gradient-to-r from-primary to-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-all text-sm hover:shadow-glow"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Get Directions <Navigation className="w-4 h-4" />
                  </a>
                  <a
                    href={`tel:${store.phone}`}
                    className="h-10 w-10 rounded-xl border border-border/60 bg-card flex items-center justify-center hover:border-primary/40 hover:text-primary transition-colors"
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Call ${store.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
          {filteredStores.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary/40" />
              <p className="font-medium">No stores match that search yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different city, neighborhood, or zip code.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="w-full lg:w-2/3 h-[400px] lg:h-auto min-h-[500px] rounded-3xl border border-border/50 overflow-hidden shadow-soft bg-card">
        <StoreLocatorMap
          stores={filteredStores.length > 0 ? filteredStores : stores}
          selectedStoreId={selectedStore?.id ?? stores[0].id}
          onSelectStore={setSelectedStoreId}
        />
      </div>
    </div>
  );
}
