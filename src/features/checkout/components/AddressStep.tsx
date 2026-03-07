"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getUserAddressesAction,
  addAddressAction,
} from "@/features/checkout/actions/addressActions";
import { checkServiceability } from "@/features/checkout/utils/serviceability";
import { toast } from "sonner";

interface AddressStepProps {
  selectedAddress: string;
  onSelect: (id: string) => void;
}

export function AddressStep({ selectedAddress, onSelect }: AddressStepProps) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await getUserAddressesAction();
      if (res.error) {
        toast.error(res.error);
      } else if (res.addresses) {
        setAddresses(res.addresses);
        if (res.addresses.length > 0 && !selectedAddress) {
          const firstServiceable = res.addresses.find((addr) =>
            checkServiceability(addr.pincode),
          );
          if (firstServiceable) {
            onSelect(firstServiceable.id);
          }
        }
      }
      setIsFetching(false);
    };
    fetchAddresses();
  }, [onSelect, selectedAddress]);

  const handleAddAddress = async (formData: FormData) => {
    setIsSubmitting(true);
    const res = await addAddressAction(formData);

    if (res.error) {
      toast.error(res.error);
    } else if (res.address) {
      toast.success("Address added successfully!");
      setAddresses([res.address, ...addresses]);
      onSelect(res.address.id);
      setIsAddingMode(false);
    }
    setIsSubmitting(false);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-in slide-in-from-right-4">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p>Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <h2 className="font-heading text-2xl flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" /> Select Delivery Address
      </h2>

      {addresses.length === 0 && !isAddingMode && (
        <div className="p-6 border-2 border-dashed border-border rounded-xl text-center">
          <MapPin className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">
            You have no saved addresses.
          </p>
          <Button onClick={() => setIsAddingMode(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Address
          </Button>
        </div>
      )}

      {!isAddingMode && addresses.length > 0 && (
        <RadioGroup
          value={selectedAddress}
          onValueChange={onSelect}
          className="space-y-3"
        >
          {addresses.map((addr) => {
            const isServiceable = checkServiceability(addr.pincode);
            return (
              <div key={addr.id} className="relative">
                <RadioGroupItem
                  value={addr.id}
                  id={`addr-${addr.id}`}
                  className="peer sr-only"
                  disabled={!isServiceable}
                />
                <Label
                  htmlFor={`addr-${addr.id}`}
                  className={`flex items-start gap-4 p-4 rounded-card border-2 transition-colors ${
                    !isServiceable
                      ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
                      : "border-border bg-card cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-block bg-secondary text-xs font-bold px-2 py-0.5 rounded-pill uppercase tracking-wider">
                        {addr.label}
                      </span>
                      {!isServiceable && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] uppercase font-bold tracking-wider rounded-sm px-1.5 py-0 h-5"
                        >
                          Not Deliverable
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1">
                      {addr.building} {addr.street}
                    </p>
                    <p className="text-sm text-foreground">{addr.area}</p>
                    {addr.landmark && (
                      <p className="text-xs italic text-muted-foreground mt-1">
                        Near {addr.landmark}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {addr.city}, {addr.state} {addr.pincode}
                    </p>
                  </div>
                </Label>
              </div>
            );
          })}
          <div className="pt-2">
            <Button
              variant="outline"
              className="gap-2 text-sm"
              onClick={() => setIsAddingMode(true)}
            >
              <Plus className="w-4 h-4" /> Add New Address
            </Button>
          </div>
        </RadioGroup>
      )}

      {isAddingMode && (
        <form
          action={handleAddAddress}
          className="space-y-4 p-5 rounded-xl border border-border bg-card shadow-sm animate-in fade-in zoom-in-95"
        >
          <h3 className="font-semibold text-lg border-b border-border/50 pb-2 mb-4">
            Add New Address
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label
                htmlFor="label"
                className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
              >
                Address Label
              </Label>
              <Input
                id="label"
                name="label"
                placeholder="e.g. Home, Work, Other"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="building"
                className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
              >
                Building/Flat No.
              </Label>
              <Input
                id="building"
                name="building"
                placeholder="Apartment / House number"
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="street"
                className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
              >
                Street/Road Name
              </Label>
              <Input
                id="street"
                name="street"
                placeholder="Street Name"
                className="h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="area"
                  className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                >
                  Area/Locality
                </Label>
                <Input
                  id="area"
                  name="area"
                  placeholder="Locality"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="landmark"
                  className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                >
                  Landmark
                </Label>
                <Input
                  id="landmark"
                  name="landmark"
                  placeholder="Near..."
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="city"
                  className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                >
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="state"
                  className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                >
                  State
                </Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="State"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="pincode"
                  className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                >
                  Pincode
                </Label>
                <Input
                  id="pincode"
                  name="pincode"
                  placeholder="Pincode"
                  required
                  className="h-10"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddingMode(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
