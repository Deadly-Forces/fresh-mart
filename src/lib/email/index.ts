/**
 * Email Delivery Utility (Outline)
 * 
 * In a full production setup, this would integrate with a service like Resend, SendGrid, or AWS SES.
 * e.g., using Resend:
 * 
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 */

export interface OrderAttachment {
    filename: string;
    content: Buffer | string;
}

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    attachments?: OrderAttachment[];
}

/**
 * Sends a generic transactional email.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        // [TODO] Production Implementation:
        // const { data, error } = await resend.emails.send({
        //     from: options.from || 'FreshMart <orders@yourdomain.com>',
        //     to: options.to,
        //     subject: options.subject,
        //     html: options.html,
        //     text: options.text,
        // });
        // if (error) throw error;

        console.log(`[Email Mock Service] -> Sending to ${options.to}`);
        console.log(`[Email Mock Service] -> Subject: ${options.subject}`);

        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

/**
 * Triggered immediately after a new order is successfully written to the database.
 */
export async function sendOrderConfirmationEmail(
    orderId: string,
    customerEmail: string,
    totalAmount: number
) {
    const subject = `Order Confirmation - #${orderId.substring(0, 8).toUpperCase()}`;
    const htmlSnippet = `
        <h1>Thank you for your order!</h1>
        <p>We've received your order and are getting it ready.</p>
        <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
        <a href="https://yourdomain.com/profile" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">View Order Status</a>
    `;

    await sendEmail({
        to: customerEmail,
        subject,
        html: htmlSnippet
    });
}
