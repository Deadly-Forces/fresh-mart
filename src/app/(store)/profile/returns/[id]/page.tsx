import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReturnRequestClient } from "@/features/profile/components/ReturnRequestClient";
import { UserOrder } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Request Return/Replace | FreshMart",
    description: "Submit a return or replace request for your order.",
};

export default async function ReturnRequestPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ type?: string }>;
}) {
    const { id: orderId } = await params;
    const { type: defaultType = "return" } = await searchParams;

    const supabase = await createClient();

    // Check auth
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // Fetch order to ensure it belongs to user
    const { data: order } = await supabase
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
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

    if (!order) {
        redirect("/profile");
    }

    // Map order
    const mappedOrder: UserOrder = {
        id: String(order.id),
        status: String(order.status) as any,
        total: Number(order.total),
        created_at: String(order.created_at),
        payment_method: order.payment_method ? String(order.payment_method) : undefined,
        payment_status: order.payment_status ? String(order.payment_status) : undefined,
        items: (order.order_items as any[]) || [],
    };

    return (
        <section className="min-h-screen pt-[72px] bg-secondary/30 pb-20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <ReturnRequestClient order={mappedOrder} defaultType={defaultType} />
            </div>
        </section>
    );
}
