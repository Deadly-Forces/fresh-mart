import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { AdminNotificationsClient } from "./AdminNotificationsClient";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const supabase = await createClient();

  // Fetch recent notifications (last 100)
  const { data: notifications } = await supabase
    .from("notifications")
    .select(
      "id, user_id, type, title, message, is_read, created_at, profiles(name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  // Fetch users for send dropdown
  const { data: users } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("role", "customer")
    .order("name");

  const formattedNotifications = (notifications || []).map((n: any) => ({
    id: n.id,
    userId: n.user_id,
    userName: n.profiles?.name || "Unknown",
    userEmail: n.profiles?.email || "",
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.is_read,
    createdAt: n.created_at,
  }));

  const formattedUsers = (users || []).map((u: any) => ({
    id: u.id,
    name: u.name || "Unnamed",
    email: u.email || "",
  }));

  return (
    <div className="space-y-6">
      <AutoRefresh intervalMs={30000} tables={["notifications"]} />
      <AdminNotificationsClient
        notifications={formattedNotifications}
        users={formattedUsers}
      />
    </div>
  );
}
