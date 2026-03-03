import { Resend } from "resend";
import { Templates } from "./templates";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789"); // Dummy key for now

export interface OrderAttachment {
  filename: string;
  content: Buffer | string;
}

export interface EmailOptions {
  to: string; // Changed to string for simplicity, can be array
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachments?: OrderAttachment[];
}

const DEFAULT_FROM_EMAIL =
  process.env.EMAIL_FROM || "FreshMart <onboarding@resend.dev>";

/**
 * Whether the Resend account has a verified domain (production mode).
 * When false, emails can only be sent to RESEND_TEST_EMAIL.
 * Set RESEND_VERIFIED_DOMAIN=true in .env once you've verified a domain at resend.com/domains.
 */
const HAS_VERIFIED_DOMAIN = process.env.RESEND_VERIFIED_DOMAIN === "true";
const RESEND_TEST_EMAIL = process.env.RESEND_TEST_EMAIL; // e.g. krishkaslikar@yahoo.com

/**
 * Sends a generic transactional email.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn(
        "[Email Service] RESEND_API_KEY is not set. Email logging only.",
      );
      console.log(`[Email Mock Service] -> Sending to ${options.to}`);
      console.log(`[Email Mock Service] -> Subject: ${options.subject}`);
      return true;
    }

    // In test mode (no verified domain), Resend only allows sending to your own email.
    // Redirect all emails to the test address, or skip if none is configured.
    let recipient = options.to;
    if (!HAS_VERIFIED_DOMAIN) {
      if (!RESEND_TEST_EMAIL) {
        console.warn(
          `[Email Service] No verified domain & RESEND_TEST_EMAIL not set. Skipping email to ${options.to}`,
        );
        console.log(`[Email Mock Service] -> Subject: ${options.subject}`);
        return true;
      }
      if (recipient !== RESEND_TEST_EMAIL) {
        console.warn(
          `[Email Service] Test mode: redirecting email from ${recipient} -> ${RESEND_TEST_EMAIL}`,
        );
        recipient = RESEND_TEST_EMAIL;
      }
    }

    const { data, error } = await resend.emails.send({
      from: options.from || DEFAULT_FROM_EMAIL,
      to: recipient,
      subject: options.subject,
      html: options.html || options.text || "",
    });

    if (error) {
      console.error("[Email Service] Resend Error:", error);
      return false;
    }

    console.log(`[Email Service] Email sent successfully: ${data?.id}`);
    return true;
  } catch (error) {
    console.error("[Email Service] Failed to send email:", error);
    return false;
  }
}

/**
 * Triggered immediately after a new order is successfully written to the database.
 */
export async function sendOrderConfirmationEmail(
  orderId: string,
  customerEmail: string,
) {
  // Fetch full order details
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
            *,
            order_items (
                quantity,
                price,
                product_snapshot
            ),
            addresses (
                street,
                city,
                state,
                pincode
            )
        `,
    )
    .eq("id", orderId)
    .single();

  if (error || !order) {
    console.error("[Email Service] Failed to fetch order details:", error);
    return;
  }

  // Cast to any to handle schema drift between types.ts and actual DB
  const orderData = order as any;

  // Map order details to template structure
  const templateData = {
    orderId: orderData.id,
    customerName: "Customer",
    items: orderData.order_items.map((item: any) => ({
      name: item.product_snapshot?.name || "Product",
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: orderData.subtotal || 0,
    deliveryFee: orderData.delivery_fee || 0,
    discount: orderData.discount || 0,
    total: orderData.total,
    deliveryAddress: orderData.addresses
      ? `${orderData.addresses.street || ""}, ${orderData.addresses.city || ""}, ${orderData.addresses.state || ""} ${orderData.addresses.pincode}`
      : "Address not available",
    deliverySlot: orderData.delivery_slot || "Standard Delivery",
  };

  const htmlContent = Templates.orderConfirmation(templateData);

  await sendEmail({
    to: customerEmail,
    subject: `Order Confirmation - #${orderId.substring(0, 8).toUpperCase()}`,
    html: htmlContent,
  });
}

export async function sendShippingUpdateEmail(orderId: string, status: string) {
  const supabase = await createClient();

  // Fetch order details (no FK join to profiles — orders.user_id references auth.users)
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    console.error(
      "[Email Service] Failed to fetch order details for shipping update:",
      error,
    );
    return;
  }

  const orderData = order as any;
  // Fetch profile separately using user_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", orderData.user_id)
    .single();

  if (!profile?.email) {
    console.error(
      "[Email Service] No email found for user:",
      orderData.user_id,
    );
    return;
  }

  const customerName = profile.name || "Customer";
  const customerEmail = profile.email;

  const htmlContent = Templates.orderStatusUpdate(
    orderId,
    customerName,
    status,
  );

  await sendEmail({
    to: customerEmail,
    subject: `Update on Order #${orderId.substring(0, 8).toUpperCase()}`,
    html: htmlContent,
  });
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const htmlContent = Templates.passwordReset(resetLink);

  await sendEmail({
    to: email,
    subject: "Reset Your Password - FreshMart",
    html: htmlContent,
  });
}
