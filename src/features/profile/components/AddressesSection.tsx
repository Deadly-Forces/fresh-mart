"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Plus,
  Loader2,
  Star,
  Edit2,
  Trash2,
  X,
  Save,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getProfileAddressesAction,
  addProfileAddressAction,
  updateProfileAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/features/profile/actions/addressActions";

interface Address {
  id: string;
  label: string | null;
  building: string | null;
  street: string | null;
  area: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  is_default: boolean | null;
}

export function AddressesSection() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    const res = await getProfileAddressesAction();
    if (res.error) {
      toast.error(res.error);
    } else if (res.addresses) {
      setAddresses(res.addresses);
    }
    setIsLoading(false);
  };

  const handleAddAddress = async (formData: FormData) => {
    setIsSubmitting(true);
    const isFirstAddress = addresses.length === 0;
    if (isFirstAddress) {
      formData.set("is_default", "true");
    }

    const res = await addProfileAddressAction(formData);
    if (res.error) {
      toast.error(res.error);
    } else if (res.address) {
      toast.success("Address added successfully!");
      setAddresses([
        res.address,
        ...addresses.map((a) =>
          isFirstAddress ? { ...a, is_default: false } : a,
        ),
      ]);
      setIsAddingMode(false);
    }
    setIsSubmitting(false);
  };

  const handleUpdateAddress = async (addressId: string, formData: FormData) => {
    setIsSubmitting(true);
    const res = await updateProfileAddressAction(addressId, formData);
    if (res.error) {
      toast.error(res.error);
    } else if (res.address) {
      toast.success("Address updated successfully!");
      setAddresses(
        addresses.map((a) => (a.id === addressId ? res.address : a)),
      );
      setEditingId(null);
    }
    setIsSubmitting(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    setDeletingId(addressId);
    const res = await deleteAddressAction(addressId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Address deleted!");
      setAddresses(addresses.filter((a) => a.id !== addressId));
    }
    setDeletingId(null);
  };

  const handleSetDefault = async (addressId: string) => {
    const res = await setDefaultAddressAction(addressId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Default address updated!");
      setAddresses(
        addresses.map((a) => ({
          ...a,
          is_default: a.id === addressId,
        })),
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-1 bg-gradient-to-r from-accent via-amber-300 to-accent/50" />
        <div className="p-6 sm:p-7 flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group lg:col-span-2">
      <div className="h-1 bg-gradient-to-r from-accent via-amber-300 to-accent/50" />
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-bold flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
              <MapPin className="w-4.5 h-4.5 text-accent" />
            </span>
            My Addresses
          </h3>
          {!isAddingMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingMode(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add Address
            </Button>
          )}
        </div>

        {/* Add New Address Form */}
        {isAddingMode && (
          <AddressForm
            onSubmit={handleAddAddress}
            onCancel={() => setIsAddingMode(false)}
            isSubmitting={isSubmitting}
            title="Add New Address"
          />
        )}

        {/* No Addresses */}
        {addresses.length === 0 && !isAddingMode && (
          <div className="p-8 rounded-xl border-2 border-dashed border-border/60 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground italic mb-2">
              No addresses saved yet
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddingMode(true)}
              className="mt-2 gap-2 font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add Your First Address
            </Button>
          </div>
        )}

        {/* Address List */}
        {addresses.length > 0 && (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id}>
                {editingId === addr.id ? (
                  <AddressForm
                    address={addr}
                    onSubmit={(formData) =>
                      handleUpdateAddress(addr.id, formData)
                    }
                    onCancel={() => setEditingId(null)}
                    isSubmitting={isSubmitting}
                    title="Edit Address"
                  />
                ) : (
                  <AddressCard
                    address={addr}
                    onEdit={() => setEditingId(addr.id)}
                    onDelete={() => handleDeleteAddress(addr.id)}
                    onSetDefault={() => handleSetDefault(addr.id)}
                    isDeleting={deletingId === addr.id}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  isDeleting: boolean;
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
}: AddressCardProps) {
  return (
    <div
      className={`p-5 rounded-xl border transition-all duration-300 ${
        address.is_default
          ? "bg-primary/5 border-primary/30"
          : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-block bg-secondary text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {address.label || "Address"}
            </span>
            {address.is_default && (
              <Badge
                variant="default"
                className="text-[10px] uppercase font-bold tracking-wider rounded-sm px-1.5 py-0 h-5 gap-1"
              >
                <Star className="w-3 h-3" /> Default
              </Badge>
            )}
          </div>
          {address.building && (
            <p className="font-semibold text-base">{address.building}</p>
          )}
          {address.street && (
            <p className="text-foreground">{address.street}</p>
          )}
          {address.area && <p className="text-foreground">{address.area}</p>}
          {address.landmark && (
            <p className="text-muted-foreground text-sm italic mt-1">
              Near {address.landmark}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              {address.city}
              {address.city && address.state ? ", " : ""}
              {address.state}
              {address.pincode && (
                <span className="font-semibold text-foreground ml-2">
                  PIN: {address.pincode}
                </span>
              )}
            </p>
          </div>
        </div>
        {/* Action Buttons - Always visible */}
        <div className="flex sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
          {!address.is_default && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSetDefault}
              className="h-8 px-3 text-xs gap-1 flex-1 sm:flex-none"
            >
              <Check className="w-3 h-3" /> Set Default
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8 px-3 gap-1 flex-1 sm:flex-none"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="h-8 px-3 gap-1 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive flex-1 sm:flex-none"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}{" "}
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AddressFormProps {
  address?: Address;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  title: string;
}

function AddressForm({
  address,
  onSubmit,
  onCancel,
  isSubmitting,
  title,
}: AddressFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!formRef.current) return;

    const formData = new FormData();
    const inputs = formRef.current.querySelectorAll("input");
    inputs.forEach((input) => {
      formData.set(input.name, input.value);
    });

    await onSubmit(formData);
  };

  return (
    <div
      ref={formRef}
      className="p-5 rounded-xl border border-border bg-card shadow-sm animate-in fade-in zoom-in-95 mb-4"
    >
      <h4 className="font-semibold text-base border-b border-border/50 pb-2 mb-4">
        {title}
      </h4>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="label"
            className="text-xs font-semibold text-muted-foreground"
          >
            Address Label
          </Label>
          <Input
            id="label"
            name="label"
            placeholder="e.g. Home, Work, Other"
            defaultValue={address?.label || "Home"}
            className="h-10 bg-background border-2 focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="building"
            className="text-xs font-semibold text-muted-foreground"
          >
            Building / Flat No.
          </Label>
          <Input
            id="building"
            name="building"
            placeholder="Apartment / House number"
            defaultValue={address?.building || ""}
            className="h-10 bg-background border-2 focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="street"
            className="text-xs font-semibold text-muted-foreground"
          >
            Street / Road Name
          </Label>
          <Input
            id="street"
            name="street"
            placeholder="Street Name"
            defaultValue={address?.street || ""}
            className="h-10 bg-background border-2 focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="area"
              className="text-xs font-semibold text-muted-foreground"
            >
              Area / Locality
            </Label>
            <Input
              id="area"
              name="area"
              placeholder="Locality"
              defaultValue={address?.area || ""}
              className="h-10 bg-background border-2 focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="landmark"
              className="text-xs font-semibold text-muted-foreground"
            >
              Landmark
            </Label>
            <Input
              id="landmark"
              name="landmark"
              placeholder="Near..."
              defaultValue={address?.landmark || ""}
              className="h-10 bg-background border-2 focus:border-primary"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="city"
              className="text-xs font-semibold text-muted-foreground"
            >
              City
            </Label>
            <Input
              id="city"
              name="city"
              placeholder="City"
              defaultValue={address?.city || ""}
              className="h-10 bg-background border-2 focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="state"
              className="text-xs font-semibold text-muted-foreground"
            >
              State
            </Label>
            <Input
              id="state"
              name="state"
              placeholder="State"
              defaultValue={address?.state || ""}
              className="h-10 bg-background border-2 focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="pincode"
              className="text-xs font-semibold text-muted-foreground"
            >
              Pincode
            </Label>
            <Input
              id="pincode"
              name="pincode"
              placeholder="6-digit"
              defaultValue={address?.pincode || ""}
              className="h-10 bg-background border-2 focus:border-primary"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-border/50">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2 min-w-[100px]"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
