import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { NotificationsList } from "@/features/notifications/components/NotificationsList";
import type { Notification } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notifications | FreshMart",
  description: "View your notifications and updates.",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <section className="min-h-screen pt-[72px]">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Suspense
          fallback={
            <div className="w-full h-64 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          }
        >
          <NotificationsList
            initialNotifications={(notifications as Notification[]) || []}
          />
        </Suspense>
      </div>
    </section>
  );
}
