"use client";

import { useState } from "react";
import { MapPin, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingState } from "@/types";

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "+94", country: "LK", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", country: "NP", flag: "🇳🇵", name: "Nepal" },
  { code: "+880", country: "BD", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+92", country: "PK", flag: "🇵🇰", name: "Pakistan" },
];

interface OnboardingAddressStepProps {
  state: OnboardingState;
  onUpdate: (updates: Partial<OnboardingState>) => void;
  onUpdateAddress: (
    field: keyof OnboardingState["address"],
    value: string,
  ) => void;
}

export function OnboardingAddressStep({
  state,
  onUpdate,
  onUpdateAddress,
}: OnboardingAddressStepProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const selectedCountry =
    COUNTRY_CODES.find((c) => c.code === state.countryCode) || COUNTRY_CODES[0];

  const reverseGeocode = async (lat: number, lon: number) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = await response.json();

    if (data.address) {
      const addr = data.address;
      const street =
        [addr.road, addr.neighbourhood, addr.suburb]
          .filter(Boolean)
          .join(", ") ||
        data.display_name?.split(",").slice(0, 2).join(",") ||
        "";

      onUpdateAddress("street", street);
      onUpdateAddress(
        "city",
        addr.city || addr.town || addr.village || addr.county || "",
      );
      onUpdateAddress("state", addr.state || "");
      onUpdateAddress("pincode", addr.postcode || "");
      return true;
    }
    return false;
  };

  const ipBasedFallback = async () => {
    // Fallback: use IP-based geolocation
    const res = await fetch(
      "http://ip-api.com/json/?fields=lat,lon,city,regionName,zip,status",
    );
    const data = await res.json();

    if (data.status === "success") {
      // Try reverse geocoding with IP coordinates for full address
      const found = await reverseGeocode(data.lat, data.lon);
      if (!found) {
        // Use IP-API data directly as last resort
        onUpdateAddress("city", data.city || "");
        onUpdateAddress("state", data.regionName || "");
        onUpdateAddress("pincode", data.zip || "");
      }
      return true;
    }
    return false;
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setLocationError(null);

    // Helper to get position as a Promise
    const getBrowserPosition = (
      highAccuracy: boolean,
      timeoutMs: number,
    ): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("not_supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: highAccuracy,
          timeout: timeoutMs,
          maximumAge: 0, // Always get fresh position
        });
      });
    };

    try {
      let position: GeolocationPosition;

      // 1. Try high accuracy first (WiFi triangulation — most precise on desktop)
      try {
        position = await getBrowserPosition(true, 15000);
      } catch {
        // 2. Fall back to low accuracy (IP-based browser location)
        try {
          position = await getBrowserPosition(false, 10000);
        } catch (geoErr: unknown) {
          // 3. Browser geolocation failed — try IP API fallback
          console.warn("Browser geolocation failed, trying IP fallback");
          const ipOk = await ipBasedFallback();
          if (ipOk) {
            setLocating(false);
            return;
          }
          throw geoErr;
        }
      }

      await reverseGeocode(position.coords.latitude, position.coords.longitude);
    } catch (err: unknown) {
      console.error("Location error:", err);
      if (err instanceof Error && "code" in err && err.code === 1) {
        setLocationError(
          "Location access denied. Please enable location in Windows Settings → Privacy → Location, then allow your browser access.",
        );
      } else {
        setLocationError(
          "Could not detect location. Please enter address manually.",
        );
      }
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <div>
        <h2 className="font-heading text-3xl mb-2">Delivery Details</h2>
        <p className="text-muted-foreground font-body">
          Where should we deliver your fresh groceries?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (For delivery driver)</Label>
        <div className="flex gap-2">
          {/* Country Code Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 h-12 px-3 rounded-md border border-input bg-secondary hover:bg-accent transition-colors text-sm font-medium min-w-[90px]"
              aria-label="Select country code"
            >
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.code}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {showDropdown && (
              <>
                {/* Backdrop to close dropdown */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-1 z-50 w-64 max-h-60 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                  {COUNTRY_CODES.map((country) => (
                    <button
                      key={country.code + country.country}
                      type="button"
                      onClick={() => {
                        onUpdate({ countryCode: country.code });
                        setShowDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left ${
                        state.countryCode === country.code
                          ? "bg-primary/10 font-medium"
                          : ""
                      }`}
                    >
                      <span className="text-base">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-muted-foreground">
                        {country.code}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Input
            id="phone"
            value={state.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            placeholder="Enter phone number"
            type="tel"
            className="h-12 flex-1"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <Label>Primary Address</Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-primary"
            onClick={handleUseCurrentLocation}
            disabled={locating}
          >
            {locating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Locating...
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3" />
                Use Current Location
              </>
            )}
          </Button>
        </div>

        {locationError && (
          <p className="text-sm text-destructive">{locationError}</p>
        )}

        <div className="grid grid-cols-1 gap-4">
          <Input
            placeholder="Building Name / Flat No."
            value={state.address.building || ""}
            onChange={(e) => onUpdateAddress("building", e.target.value)}
            className="h-12"
          />
          <Input
            placeholder="Street Address or Road Name"
            value={state.address.street}
            onChange={(e) => onUpdateAddress("street", e.target.value)}
            className="h-12"
          />
          <Input
            placeholder="Area / Locality"
            value={state.address.area || ""}
            onChange={(e) => onUpdateAddress("area", e.target.value)}
            className="h-12"
          />
          <Input
            placeholder="Landmark (Optional)"
            value={state.address.landmark || ""}
            onChange={(e) => onUpdateAddress("landmark", e.target.value)}
            className="h-12"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="City"
              value={state.address.city}
              onChange={(e) => onUpdateAddress("city", e.target.value)}
              className="h-12"
            />
            <Input
              placeholder="State"
              value={state.address.state}
              onChange={(e) => onUpdateAddress("state", e.target.value)}
              className="h-12"
            />
          </div>
          <Input
            placeholder="Pincode / ZIP"
            value={state.address.pincode}
            onChange={(e) => onUpdateAddress("pincode", e.target.value)}
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
}
