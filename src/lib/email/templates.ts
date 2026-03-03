// Email Templates
// Basic HTML templates for transactional emails

interface OrderDetails {
  orderId: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress: string;
  deliverySlot?: string;
}

const PRIMARY_COLOR = "#16a34a"; // Green 600

const BaseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: ${PRIMARY_COLOR}; color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: -0.5px; }
        .content { padding: 30px 20px; }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; background-color: ${PRIMARY_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        .info-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th { text-align: left; border-bottom: 2px solid #e5e7eb; padding: 10px; font-size: 14px; color: #4b5563; }
        .table td { border-bottom: 1px solid #e5e7eb; padding: 10px; font-size: 14px; }
        .total-row td { font-weight: bold; border-bottom: none; }
        .address { font-style: normal; color: #4b5563; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FreshMart</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} FreshMart. All rights reserved.</p>
            <p>123 Grocery Lane, Market City, MC 12345</p>
        </div>
    </div>
</body>
</html>
`;

export const Templates = {
  orderConfirmation: (order: OrderDetails) => {
    const itemsHtml = order.items
      .map(
        (item) => `
            <tr>
                <td>${item.name} <span style="color: #6b7280; font-size: 12px;">x${item.quantity}</span></td>
                <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `,
      )
      .join("");

    const content = `
            <h2 style="color: ${PRIMARY_COLOR}; margin-top: 0;">Order Confirmed!</h2>
            <p>Hi ${order.customerName},</p>
            <p>Thank you for your order. We've received it and will begin processing it shortly.</p>
            
            <div class="info-box">
                <strong>Order #${order.orderId.substring(0, 8).toUpperCase()}</strong>
                <br>
                Expected Delivery: ${order.deliverySlot || "Standard Delivery"}
            </div>

            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr>
                        <td colspan="2" style="padding-top: 10px;"></td>
                    </tr>
                    <tr>
                        <td>Subtotal</td>
                        <td style="text-align: right;">₹${order.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Delivery Fee</td>
                        <td style="text-align: right;">₹${order.deliveryFee.toFixed(2)}</td>
                    </tr>
                    ${
                      order.discount > 0
                        ? `
                    <tr>
                        <td>Discount</td>
                        <td style="text-align: right; color: #16a34a;">-₹${order.discount.toFixed(2)}</td>
                    </tr>
                    `
                        : ""
                    }
                    <tr class="total-row">
                        <td style="font-size: 16px;">Total</td>
                        <td style="text-align: right; font-size: 16px;">₹${order.total.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <h3 style="margin-top: 30px; font-size: 16px;">Delivery Address</h3>
            <div class="address">
                ${order.deliveryAddress.replace(/\n/g, "<br>")}
            </div>

            <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/profile/orders/${order.orderId}" class="button">Track Your Order</a>
            </div>
        `;

    return BaseTemplate(
      content,
      `Order Confirmed #${order.orderId.substring(0, 8).toUpperCase()}`,
    );
  },

  orderStatusUpdate: (
    orderId: string,
    customerName: string,
    status: string,
    trackingUrl?: string,
  ) => {
    const formattedStatus = status.replace(/_/g, " ").toUpperCase();

    let statusMessage = "";
    switch (status) {
      case "picked":
        statusMessage = "Your items have been picked and packed with care.";
        break;
      case "out_for_delivery":
        statusMessage =
          "Your order is on the way! Our rider will arrive shortly.";
        break;
      case "delivered":
        statusMessage =
          "Your order has been delivered using our contactless delivery. Enjoy!"; // Removed tracking URL for delivered
        break;
      case "cancelled":
        statusMessage =
          "Your order has been cancelled. Any payment made will be refunded within 5-7 business days."; // Different tone
        break;
      default:
        statusMessage = `Your order status has been updated to ${formattedStatus}.`;
    }

    const content = `
            <h2 style="color: ${PRIMARY_COLOR}; margin-top: 0;">Order Update</h2>
            <p>Hi ${customerName},</p>
            <p>There is an update on your order <strong>#${orderId.substring(0, 8).toUpperCase()}</strong>.</p>
            
            <div class="info-box" style="text-align: center;">
                <h3 style="margin: 0; color: ${PRIMARY_COLOR};">${formattedStatus}</h3>
                <p style="margin: 10px 0 0 0;">${statusMessage}</p>
            </div>

            ${
              status !== "cancelled"
                ? `
            <div style="text-align: center; margin-top: 30px;">
                <a href="${trackingUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/profile/orders/${orderId}`}" class="button">View Order Details</a>
            </div>
            `
                : ""
            }
        `;

    return BaseTemplate(
      content,
      `Order Update #${orderId.substring(0, 8).toUpperCase()}`,
    );
  },

  passwordReset: (resetUrl: string) => {
    const content = `
            <h2 style="color: ${PRIMARY_COLOR}; margin-top: 0;">Reset Your Password</h2>
            <p>We received a request to reset your password for your FreshMart account.</p>
            <p>Click the button below to reset it. This link is valid for 1 hour.</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">If you didn't ask to reset your password, you can safely ignore this email.</p>
        `;

    return BaseTemplate(content, "Reset Your Password");
  },
};
