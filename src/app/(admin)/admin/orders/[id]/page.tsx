import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { OrderDetailClient } from "./OrderDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch order with its items
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(`
      *,
      order_items (*)
    `)
        .eq("id", id)
        .single();

    if (orderError || !order) {
        console.error("Failed to fetch order:", orderError);
        return notFound();
    }

    // Fetch user profile
    let profile = null;
    if (order.user_id) {
        const { data: profileData } = await supabase
            .from("profiles")
            .select("name, phone, email")
            .eq("id", order.user_id)
            .single();
        profile = profileData;
    }

    // Fetch address
    let address = null;
    if (order.address_id) {
        const { data: addressData } = await supabase
            .from("addresses")
            .select("*")
            .eq("id", order.address_id)
            .single();
        address = addressData;
    }

    // Format order data for client
    const formattedOrder = {
        id: order.id,
        shortId: order.id.slice(0, 8).toUpperCase(),
        status: order.status,
        createdAt: order.created_at,
        total: Number(order.total) || 0,
        subtotal: Number(order.subtotal) || 0,
        deliveryFee: Number(order.delivery_fee) || 0,
        discountAmount: Number(order.discount_amount) || 0,
        appliedPromocode: order.applied_promocode,
        paymentStatus: order.payment_status || "pending",
        paymentMethod: order.payment_method || "N/A",
        notes: order.notes,
        items: Array.isArray(order.order_items) ? order.order_items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            quantity: item.quantity,
            price: Number(item.price),
            snapshot: item.product_snapshot || {},
        })) : [],
        customer: profile ? {
            name: profile.name || "Unknown",
            phone: profile.phone || "N/A",
            email: profile.email || "N/A",
        } : null,
        address: address ? {
            formatted: [
                address.building,
                address.street,
                address.area,
                address.landmark ? `Near ${address.landmark}` : null,
                address.city,
                address.state,
                address.pincode,
            ].filter(Boolean).join(", ")
        } : null,
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <OrderDetailClient order={formattedOrder} />
        </div>
    );
}
