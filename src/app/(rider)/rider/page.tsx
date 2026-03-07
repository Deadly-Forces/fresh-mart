import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RiderClient } from "./RiderClient";
import { getRiderOrdersAction } from "@/features/staff/actions/staffOrderActions";
import { Navigation2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RiderDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "delivery") redirect("/");

  const { orders, error } = await getRiderOrdersAction();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
        <Navigation2 className="w-10 h-10 text-destructive/40" />
        <p className="text-sm text-destructive font-medium">
          Failed to load deliveries
        </p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <RiderClient
      initialOrders={orders as any}
      riderName={profile?.name || "Rider"}
    />
  );
}
