import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

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
        uses: `${c.used_count || 0}/${c.max_uses || "∞"}`,
        expiry: c.expires_at
            ? new Date(c.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "No expiry",
        active: c.is_active,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <AutoRefresh intervalMs={30000} tables={["coupons"]} />
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Add Coupon</Button>
            </div>

            <div className="bg-card border border-border rounded-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-secondary/50 border-b border-border">
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Code</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Type</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Value</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Min. Order</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Uses</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Expiry</th>
                                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">Status</th>
                                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No coupons found. Create your first coupon to get started.</td>
                                </tr>
                            ) : coupons.map((c) => (
                                <tr key={c.id} className="hover:bg-secondary/30">
                                    <td className="px-4 py-3 font-mono font-bold text-primary">{c.code}</td>
                                    <td className="px-4 py-3 capitalize text-muted-foreground">{c.type}</td>
                                    <td className="px-4 py-3 font-medium">{c.type === "percentage" ? `${c.value}%` : `$${c.value}`}</td>
                                    <td className="px-4 py-3 text-muted-foreground">${c.minOrder}</td>
                                    <td className="px-4 py-3">{c.uses}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.expiry}</td>
                                    <td className="px-4 py-3">
                                        <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${c.active ? "bg-success" : "bg-muted"}`} />
                                        <span className="text-xs">{c.active ? "Active" : "Expired"}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-xs text-primary hover:underline mr-2">Edit</button>
                                        <button className="text-xs text-muted-foreground hover:text-destructive">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
