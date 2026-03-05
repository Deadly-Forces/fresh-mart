import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { BannerManager } from "./BannerManager";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const supabase = await createClient();

  const { data: bannersData } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });

  const banners = (bannersData || []).map((b: any) => ({
    id: b.id,
    title: b.title,
    link: b.link || "/shop",
    image_url: b.image_url,
    active: b.is_active,
    dates:
      [
        b.starts_at
          ? new Date(b.starts_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          : null,
        b.ends_at
          ? new Date(b.ends_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          : null,
      ]
        .filter(Boolean)
        .join(" – ") || "Always active",
    rawSortOrder: b.sort_order || 0,
    rawStartsAt: b.starts_at ?? null,
    rawEndsAt: b.ends_at ?? null,
  }));

  return (
    <div className="space-y-6">
      <AutoRefresh intervalMs={30000} tables={["banners"]} />
      <BannerManager banners={banners} />
    </div>
  );
}

