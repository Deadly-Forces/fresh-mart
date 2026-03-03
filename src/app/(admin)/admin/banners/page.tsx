import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

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
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AutoRefresh intervalMs={30000} tables={["banners"]} />
        <Button size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-card border border-border rounded-card p-8 text-center text-muted-foreground">
          <p className="text-sm">
            No banners found. Add your first banner to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-4 bg-card border border-border rounded-card p-4"
            >
              <span className="text-muted-foreground cursor-grab">⠿</span>
              {b.image_url ? (
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="w-24 h-14 object-cover rounded-md shrink-0 border"
                />
              ) : (
                <div className="w-24 h-14 bg-secondary rounded-md shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                  Preview
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{b.title}</p>
                <p className="text-xs text-muted-foreground">
                  {b.link} • {b.dates}
                </p>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${b.active ? "bg-success" : "bg-muted"}`}
              />
              <button className="text-xs text-primary hover:underline">
                Edit
              </button>
              <button className="text-xs text-muted-foreground hover:text-destructive">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
