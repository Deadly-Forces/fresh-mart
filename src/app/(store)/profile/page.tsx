import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileDashboard } from "@/features/profile/components/ProfileDashboard";
import { UserOrderItem } from "@/types";

export const metadata = {
    title: "Profile Dashboard | FreshMart",
    description: "Manage your profile, addresses, and preferences.",
};

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
    const params = await searchParams;
    const initialEditing = params.edit === "true";
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // Fetch user profile data
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        // Fallback if profile doesn't exist but user does (e.g. didn't finish onboarding)
        redirect("/onboarding");
    }

    // Fetch user's default address (limit 1 in case multiple are marked default)
    const { data: address } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle to avoid errors if none exist

    // Fetch user's orders with items
    const { data: rawOrders } = await supabase
        .from("orders")
        .select(`
            id,
            status,
            total,
            created_at,
            payment_method,
            payment_status,
            order_items (
                id,
                quantity,
                price,
                product_snapshot,
                product_id
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    // Map the Supabase response to our UserOrder type structure
    const orders = (rawOrders || []).map((order: Record<string, unknown>) => ({
        id: String(order.id),
        status: String(order.status) as "pending" | "confirmed" | "packed" | "out_for_delivery" | "delivered" | "cancelled",
        total: Number(order.total),
        created_at: String(order.created_at),
        payment_method: order.payment_method ? String(order.payment_method) : undefined,
        payment_status: order.payment_status ? String(order.payment_status) : undefined,
        items: (order.order_items as UserOrderItem[]) || [],
    }));

    const profileData = {
        ...profile,
        dietary_pref: profile.dietary_preference,
        notifications: true as boolean | null,
        address: address ? {
            building: address.building || "",
            street: address.street || "",
            area: address.area || "",
            landmark: address.landmark || "",
            city: address.city || "",
            state: address.state || "",
            pincode: address.pincode || ""
        } : null
    };

    return (
        <main className="min-h-screen pt-[72px]">
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                <ProfileDashboard profile={profileData} email={user.email || ""} orders={orders} initialEditing={initialEditing} />
            </div>
        </main>
    );
}
