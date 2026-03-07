import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { UserOrder } from "@/types";

export function generateInvoice(order: UserOrder) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Header ---
  doc.setFillColor(22, 163, 74); // Primary green
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("FreshMart", 20, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Fresh Groceries, Delivered", 20, 30);

  // Invoice label
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 20, 22, { align: "right" });

  // --- Meta info ---
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const orderDate = new Date(order.created_at);
  const dateStr = orderDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = orderDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let y = 55;
  doc.setFont("helvetica", "bold");
  doc.text("Order Number:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, 70, y);

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Date:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${dateStr}, ${timeStr}`, 70, y);

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 20, y);
  doc.setFont("helvetica", "normal");
  const statusText = order.status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  doc.text(statusText, 70, y);

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Payment:", 20, y);
  doc.setFont("helvetica", "normal");
  const paymentText =
    order.payment_method === "cod"
      ? "Cash on Delivery"
      : (order.payment_method || "Online").replace(/\b\w/g, (c) =>
          c.toUpperCase(),
        );
  const paymentStatus =
    order.payment_status === "paid" ? " (Paid)" : " (Pending)";
  doc.text(paymentText + paymentStatus, 70, y);

  // --- Separator ---
  y += 12;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);

  // --- Items table ---
  y += 5;

  const items = (order.items || []).map((item, idx) => {
    const name = String(item.product_snapshot?.name || `Item ${idx + 1}`);
    return [
      String(idx + 1),
      name,
      String(item.quantity),
      `Rs.${Number(item.price).toFixed(2)}`,
      `Rs.${(item.price * item.quantity).toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["#", "Item", "Qty", "Price", "Total"]],
    body: items,
    theme: "striped",
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: 20, right: 20 },
    didDrawPage: () => {
      // Footer on each page
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "FreshMart — Fresh Groceries, Delivered • www.freshmart.com",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      );
    },
  });

  // --- Totals section ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
  let totalsY = finalY + 12;

  const subtotal =
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    order.total;
  const discount = subtotal - order.total;

  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - 90, totalsY - 5, pageWidth - 20, totalsY - 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal:", pageWidth - 90, totalsY);
  doc.text(`Rs.${subtotal.toFixed(2)}`, pageWidth - 20, totalsY, {
    align: "right",
  });

  if (discount > 0) {
    totalsY += 7;
    doc.setTextColor(22, 163, 74);
    doc.text("Discount:", pageWidth - 90, totalsY);
    doc.text(`-Rs.${discount.toFixed(2)}`, pageWidth - 20, totalsY, {
      align: "right",
    });
  }

  totalsY += 10;
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(1);
  doc.line(pageWidth - 90, totalsY - 3, pageWidth - 20, totalsY - 3);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74);
  doc.text("Total:", pageWidth - 90, totalsY + 4);
  doc.text(`Rs.${order.total.toFixed(2)}`, pageWidth - 20, totalsY + 4, {
    align: "right",
  });

  // --- Thank you note ---
  const thankY = totalsY + 25;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for shopping with FreshMart!", pageWidth / 2, thankY, {
    align: "center",
  });

  // --- Download ---
  doc.save(`FreshMart-Invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`);
}
