import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { CouponManager } from "./CouponManager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const supabase = await createClient();

  const { data: couponsData } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  const coupons = (couponsData || []).map((c: any) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value || 0),
    minOrder: Number(c.min_order || 0),
    maxDiscount: c.max_discount ? Number(c.max_discount) : null,
    perUserLimit: c.per_user_limit ?? null,
    description: c.description || "",
    uses: `${c.used_count || 0}/${c.max_uses || "∞"}`,
    expiry: c.expires_at
      ? new Date(c.expires_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      : "No expiry",
    active: c.is_active,
    rawMaxUses: c.max_uses ?? null,
    rawExpiresAt: c.expires_at ?? null,
  }));

  return (
    <div className="space-y-6">
      <AutoRefresh intervalMs={30000} tables={["coupons"]} />
      <CouponManager coupons={coupons} />
    </div>
  );
}
