"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Utensils,
  Clock,
  Camera,
  ShoppingBag,
  CalendarDays,
  Sparkles,
  Heart,
  Edit2,
  X,
  Save,
  Loader2,
  Package,
  Star,
  Users,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { updateProfileAction } from "@/features/profile/actions/updateProfile";
import { deleteOrderAction } from "@/features/profile/actions/deleteOrder";
import { uploadAvatarAction } from "@/features/profile/actions/uploadAvatar";
import { AddressesSection } from "@/features/profile/components/AddressesSection";
import { getProfileAddressesAction } from "@/features/profile/actions/addressActions";
import { UserOrder } from "@/types";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCartStore } from "@/features/cart/store/useCartStore";
import dynamic from "next/dynamic";

const DeliveryCountdown = dynamic(
  () =>
    import("@/components/ui/DeliveryCountdown").then(
      (m) => m.DeliveryCountdown,
    ),
  { ssr: false },
);

const DynamicProfileOrdersTab = dynamic(
  () => import("./ProfileOrdersTab").then((m) => m.ProfileOrdersTab),
  {
    loading: () => (
      <div className="p-8 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    ),
  },
);

const DynamicLoyaltyRewardsTab = dynamic(
  () => import("./LoyaltyRewardsTab").then((m) => m.LoyaltyRewardsTab),
  {
    loading: () => (
      <div className="p-8 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    ),
  },
);

const DynamicReferralTab = dynamic(
  () => import("./ReferralTab").then((m) => m.ReferralTab),
  {
    loading: () => (
      <div className="p-8 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    ),
  },
);

const DynamicReturnRefundTab = dynamic(
  () => import("./ReturnRefundTab").then((m) => m.ReturnRefundTab),
  {
    loading: () => (
      <div className="p-8 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    ),
  },
);

interface ProfileData {
  id: string;
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
  country_code: string | null;
  address: {
    building: string;
    street: string;
    area: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
  dietary_pref: string | null;
  delivery_slot: string | null;
  notifications: boolean | null;
  created_at: string;
}

interface ProfileDashboardProps {
  profile: ProfileData;
  email: string;
  orders?: UserOrder[];
  initialEditing?: boolean;
  initialTab?: string;
}

interface DefaultAddress {
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

export function ProfileDashboard({
  profile,
  email,
  orders = [],
  initialEditing = false,
  initialTab = "details",
}: ProfileDashboardProps) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(
    null,
  );
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Sync activeTab from server prop (survives router.refresh)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Update URL when tab changes without triggering a server re-render.
  // router.replace() in Next.js App Router causes a full server fetch —
  // window.history.replaceState() only updates the browser URL bar, no fetch.
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "details") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    const newUrl = `${pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  };

  // Fetch default address on mount
  useEffect(() => {
    const fetchDefaultAddress = async () => {
      setIsLoadingAddress(true);
      const res = await getProfileAddressesAction();
      if (res.addresses && res.addresses.length > 0) {
        // Find the default address, or use the first one
        const defaultAddr =
          res.addresses.find((a: DefaultAddress) => a.is_default) ||
          res.addresses[0];
        setDefaultAddress(defaultAddr);
      }
      setIsLoadingAddress(false);
    };
    fetchDefaultAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialEditing) {
      setIsEditing(true);
      setActiveTab("details");
    }
  }, [initialEditing]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const result = await uploadAvatarAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.avatarUrl) {
        setAvatarUrl(result.avatarUrl);
        toast.success("Profile picture updated!");
      }
    } catch {
      toast.error("Failed to upload profile picture.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Use UTC methods for deterministic server/client output (avoids timezone hydration mismatch)
  const _d = new Date(profile.created_at);
  const _months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const formattedDate = `${_months[_d.getUTCMonth()]} ${_d.getUTCDate()}, ${_d.getUTCFullYear()}`;

  const [memberDays, setMemberDays] = useState<number | null>(null);
  useEffect(() => {
    setMemberDays(
      Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
  }, [profile.created_at]);

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const result = await updateProfileAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ═══════════════════════════════════════════════ */}
      {/* PROFILE HEADER CARD                            */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="bg-card border border-border rounded-2xl shadow-sm mb-6">
        {/* Gradient Banner */}
        <div className="h-36 sm:h-40 relative overflow-hidden rounded-t-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(160,60%,15%)] via-[hsl(160,50%,22%)] to-[hsl(138,40%,30%)]" />
          <div className="absolute top-6 right-8 w-20 h-20 rounded-full bg-white/5 blur-sm" />
          <div className="absolute top-16 right-28 w-12 h-12 rounded-full bg-white/5 blur-sm" />
          <div className="absolute bottom-4 left-12 w-16 h-16 rounded-full bg-white/5 blur-sm" />
        </div>

        {/* Avatar + Info + Actions row */}
        <div className="px-6 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0 -mt-12 sm:-mt-16 mx-auto sm:mx-0 z-10">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
                aria-label="Upload profile picture"
              />
              <div className="p-1 rounded-full bg-gradient-to-br from-primary via-emerald-400 to-accent shadow-xl">
                <div
                  className={`relative group rounded-full bg-background p-1 ${isEditing ? "cursor-pointer" : ""}`}
                  onClick={() =>
                    isEditing &&
                    !isUploadingAvatar &&
                    fileInputRef.current?.click()
                  }
                  role="button"
                  tabIndex={isEditing ? 0 : -1}
                  aria-label="Change profile picture"
                  onKeyDown={(e) =>
                    isEditing &&
                    e.key === "Enter" &&
                    fileInputRef.current?.click()
                  }
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={profile.name || "User"}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-1 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {isUploadingAvatar ? (
                        <Loader2 className="w-7 h-7 text-white animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-white mb-0.5" />
                          <span className="text-white text-[10px] font-semibold">
                            Change
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-1 rounded-full bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-7 h-7 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Name + Email + Edit button */}
            <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6 w-full pt-4 sm:pt-4">
              <div className="text-center sm:text-left flex-1 min-w-[200px]">
                {isEditing ? (
                  <div className="space-y-1.5 w-full">
                    <Label
                      htmlFor="name"
                      className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      form="profile-details-form"
                      name="name"
                      defaultValue={profile.name || ""}
                      className="font-heading font-semibold text-xl h-10 bg-background border-2 focus:border-primary transition-colors max-w-[320px] w-full"
                      placeholder="Your Name"
                    />
                  </div>
                ) : (
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">
                    {profile.name || "Valued Customer"}
                  </h2>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground justify-center sm:justify-start">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {email}
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Joined{" "}
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Edit / Save / Cancel buttons */}
              <div className="flex gap-3 flex-wrap justify-center sm:justify-end shrink-0 sm:pt-2">
                {!isEditing ? (
                  <Button
                    type="button"
                    className="gap-2 px-6 h-10 rounded-full font-semibold shadow-sm active:scale-95 transition-transform"
                    onClick={() => {
                      setIsEditing(true);
                      setActiveTab("details");
                    }}
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      className="gap-2 px-6 h-10 rounded-full font-semibold shadow-sm active:scale-95 transition-transform shrink-0 min-w-[120px]"
                      style={{ backgroundColor: "#dc2626", color: "white" }}
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                    <Button
                      type="submit"
                      form="profile-details-form"
                      className="gap-2 px-6 h-10 rounded-full font-semibold shadow-sm active:scale-95 transition-transform shrink-0 min-w-[140px]"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSaving ? "Saving…" : "Save Changes"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* QUICK STATS                             */}
      {/* ═══════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="group bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-4.5 h-4.5 text-primary" />
          </div>
          <p className="text-xl font-heading font-bold text-primary">
            {orders.length}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            Total Orders
          </p>
        </div>
        <div className="group bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Package className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <p className="text-xl font-heading font-bold text-emerald-600">
            {deliveredOrders}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            Delivered
          </p>
        </div>
        <div className="group bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <p className="text-xl font-heading font-bold text-amber-600">
            ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            Total Spent
          </p>
        </div>
        <div className="group bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <CalendarDays className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <p className="text-xl font-heading font-bold text-blue-600">
            {memberDays ?? "—"}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            Days as Member
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* TABS: DETAILS & ORDERS                  */}
      {/* ═══════════════════════════════════════ */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full max-w-full overflow-hidden"
      >
        <TabsList className="flex w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory mb-6 bg-secondary/50 h-14 p-1.5 rounded-xl border border-border/50 backdrop-blur-sm">
          <TabsTrigger
            value="details"
            className="flex-1 min-w-[150px] shrink-0 snap-start rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 gap-2"
            disabled={isEditing}
          >
            <User className="w-4 h-4" /> Profile Details
          </TabsTrigger>
          <TabsTrigger
            value="addresses"
            className="flex-1 min-w-[150px] shrink-0 snap-start rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 gap-2"
            disabled={isEditing}
          >
            <MapPin className="w-4 h-4" /> My Addresses
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="flex-1 min-w-[150px] shrink-0 snap-start rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 gap-2"
            disabled={isEditing}
          >
            <ShoppingBag className="w-4 h-4" /> Order History
          </TabsTrigger>
          <TabsTrigger
            value="rewards"
            className="flex-1 min-w-[150px] shrink-0 snap-start rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 gap-2"
            disabled={isEditing}
          >
            <Star className="w-4 h-4" /> Rewards
          </TabsTrigger>
          <TabsTrigger
            value="referrals"
            className="flex-1 min-w-[150px] shrink-0 snap-start rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 gap-2"
            disabled={isEditing}
          >
            <Users className="w-4 h-4" /> Referrals
          </TabsTrigger>
          <TabsTrigger
            value="returns"
            className="flex-1 min-w-[150px] shrink-0 snap-start rounded-lg font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 gap-2"
            disabled={isEditing}
          >
            <RotateCcw className="w-4 h-4" /> Returns
          </TabsTrigger>
        </TabsList>

        {/* ═══════ PROFILE DETAILS TAB ═══════ */}
        <TabsContent
          value="details"
          className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <form
            id="profile-details-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nameInput = document.getElementById(
                "name",
              ) as HTMLInputElement;
              if (nameInput) {
                formData.set("name", nameInput.value);
              }
              await handleSave(formData);
            }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Contact Card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary/50" />
              <div className="p-6 sm:p-7">
                <h3 className="text-lg font-heading font-bold mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Phone className="w-4.5 h-4.5 text-primary" />
                  </span>
                  Contact Information
                </h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/40 border border-border/30 hover:bg-secondary/60 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Phone Number
                      </p>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            name="country_code"
                            defaultValue={profile.country_code || "+91"}
                            className="w-20 bg-background border-2 focus:border-primary"
                            placeholder="+91"
                          />
                          <Input
                            name="phone"
                            defaultValue={profile.phone || ""}
                            className="flex-1 bg-background border-2 focus:border-primary"
                            placeholder="Phone number"
                          />
                        </div>
                      ) : (
                        <p className="font-semibold text-lg">
                          {profile.country_code || "+91"}{" "}
                          {profile.phone || (
                            <span className="text-muted-foreground italic text-sm font-normal">
                              Not provided
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/40 border border-border/30 hover:bg-secondary/60 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Email Address
                      </p>
                      <p className="font-semibold text-lg truncate">{email}</p>
                      <p className="text-xs text-muted-foreground italic mt-1">
                        Linked to Google account
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/40 border border-border/30 hover:bg-secondary/60 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CalendarDays className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Member Since
                      </p>
                      <p className="font-semibold text-lg">{formattedDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Card - Quick View */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="h-1 bg-gradient-to-r from-accent via-amber-300 to-accent/50" />
              <div className="p-6 sm:p-7">
                <h3 className="text-lg font-heading font-bold mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                    <MapPin className="w-4.5 h-4.5 text-accent" />
                  </span>
                  Delivery Address
                </h3>

                {isLoadingAddress ? (
                  <div className="p-8 rounded-xl border-2 border-dashed border-border/60 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : defaultAddress ? (
                  <div className="p-5 rounded-xl bg-secondary/30 border border-border/50 space-y-1.5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-accent/20 text-accent text-xs font-bold px-2 py-0.5 rounded-pill uppercase tracking-wider">
                        {defaultAddress.label || "Address"}
                      </span>
                      {defaultAddress.is_default && (
                        <span className="inline-block bg-primary/15 text-primary text-xs font-semibold px-2 py-0.5 rounded-pill">
                          Default
                        </span>
                      )}
                    </div>
                    {defaultAddress.building && (
                      <p className="font-semibold text-base">
                        {defaultAddress.building}
                      </p>
                    )}
                    {defaultAddress.street && (
                      <p className="text-foreground">{defaultAddress.street}</p>
                    )}
                    {defaultAddress.area && (
                      <p className="text-foreground">{defaultAddress.area}</p>
                    )}
                    {defaultAddress.landmark && (
                      <p className="text-muted-foreground text-sm italic mt-2">
                        Near {defaultAddress.landmark}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        {defaultAddress.city}
                        {defaultAddress.city && defaultAddress.state
                          ? ", "
                          : ""}
                        {defaultAddress.state}
                        {defaultAddress.pincode && (
                          <span className="font-semibold text-foreground ml-2">
                            PIN: {defaultAddress.pincode}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="pt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("addresses")}
                        className="gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Manage All Addresses
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-xl border-2 border-dashed border-border/60 text-center">
                    <MapPin className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground italic mb-2">
                      No address saved yet
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("addresses")}
                      className="mt-2 gap-2 font-medium"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Add Address
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Preferences Card — full width */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="h-1 bg-gradient-to-r from-emerald-400 via-primary to-emerald-600/50" />
              <div className="p-6 sm:p-7">
                <h3 className="text-lg font-heading font-bold mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
                    <Heart className="w-4.5 h-4.5 text-emerald-600" />
                  </span>
                  Shopping Preferences
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="relative p-5 rounded-xl bg-gradient-to-br from-secondary/40 to-secondary/60 border border-border/40 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Utensils className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Dietary Preference
                      </p>
                    </div>

                    {isEditing ? (
                      <Select
                        name="dietary_pref"
                        defaultValue={profile.dietary_pref || "any"}
                      >
                        <SelectTrigger className="bg-background border-2 focus:border-primary h-11">
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="veg">🥬 Vegetarian</SelectItem>
                          <SelectItem value="non-veg">
                            🍖 Non-Vegetarian
                          </SelectItem>
                          <SelectItem value="vegan">🌱 Vegan</SelectItem>
                          <SelectItem value="any">🍽️ No Preference</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-3 h-3 rounded-full shadow-lg ${
                            profile.dietary_pref === "veg"
                              ? "bg-green-500 shadow-green-500/40"
                              : profile.dietary_pref === "non-veg"
                                ? "bg-red-500 shadow-red-500/40"
                                : profile.dietary_pref === "vegan"
                                  ? "bg-emerald-500 shadow-emerald-500/40"
                                  : "bg-blue-500 shadow-blue-500/40"
                          }`}
                        />
                        <p className="font-bold capitalize text-xl">
                          {profile.dietary_pref || "Not specified"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="relative p-5 rounded-xl bg-gradient-to-br from-secondary/40 to-secondary/60 border border-border/40 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Delivery Slot
                      </p>
                    </div>

                    {isEditing ? (
                      <Select
                        name="delivery_slot"
                        defaultValue={profile.delivery_slot || "flexible"}
                      >
                        <SelectTrigger className="bg-background border-2 focus:border-primary h-11">
                          <SelectValue placeholder="Select slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">
                            🌅 Morning (8AM - 11AM)
                          </SelectItem>
                          <SelectItem value="afternoon">
                            ☀️ Afternoon (12PM - 4PM)
                          </SelectItem>
                          <SelectItem value="evening">
                            🌙 Evening (5PM - 9PM)
                          </SelectItem>
                          <SelectItem value="flexible">⏰ Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-bold capitalize text-xl">
                        {profile.delivery_slot
                          ? profile.delivery_slot.replace("-", " ")
                          : "Flexible"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </TabsContent>

        {/* ═══════ ADDRESSES TAB ═══════ */}
        <TabsContent
          value="addresses"
          className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <AddressesSection />
        </TabsContent>

        {/* ═══════ ORDER HISTORY TAB ═══════ */}
        <TabsContent
          value="orders"
          className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {activeTab === "orders" && (
            <DynamicProfileOrdersTab orders={orders} />
          )}
        </TabsContent>

        {/* ═══════ REWARDS TAB ═══════ */}
        <TabsContent
          value="rewards"
          className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {activeTab === "rewards" && <DynamicLoyaltyRewardsTab />}
        </TabsContent>

        {/* ═══════ REFERRALS TAB ═══════ */}
        <TabsContent
          value="referrals"
          className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {activeTab === "referrals" && <DynamicReferralTab />}
        </TabsContent>

        {/* ═══════ RETURNS TAB ═══════ */}
        <TabsContent
          value="returns"
          className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {activeTab === "returns" && (
            <DynamicReturnRefundTab orders={orders} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
