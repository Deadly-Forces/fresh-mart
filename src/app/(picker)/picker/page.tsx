import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PickerClient } from "./PickerClient";
import { getPickerOrdersAction } from "@/features/staff/actions/staffOrderActions";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PickerDashboard() {
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

  if (profile?.role !== "picker") redirect("/");

  const { orders, error } = await getPickerOrdersAction();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
        <Package className="w-10 h-10 text-destructive/40" />
        <p className="text-sm text-destructive font-medium">
          Failed to load orders
        </p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <PickerClient
      initialOrders={orders as any}
      pickerName={profile?.name || "Picker"}
    />
  );
}
