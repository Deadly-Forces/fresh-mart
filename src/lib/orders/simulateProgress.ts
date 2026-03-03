export function simulateOrderProgress(order: any) {
  if (!order || order.status === "cancelled") return order;

  // Support both createdAt and created_at variations
  const created = new Date(order.created_at || order.createdAt).getTime();
  if (isNaN(created)) return order;

  const elapsedMin = (Date.now() - created) / 60000;

  let newStatus = order.status;
  let newPayment = order.payment_status || order.paymentStatus || "pending";

  // Auto-advance logic ONLY IF DB hasn't advanced it manually beyond this point
  if (elapsedMin >= 13) {
    newStatus = "delivered";
    newPayment = "paid";
  } else if (elapsedMin >= 9) {
    newStatus = "out_for_delivery";
  } else if (elapsedMin >= 5) {
    newStatus = "packed";
  } else if (elapsedMin >= 2) {
    newStatus = "confirmed";
  }

  // Only upgrade if simulated is ahead of actual
  const statusOrder = [
    "pending",
    "processing",
    "confirmed",
    "packed",
    "out_for_delivery",
    "delivered",
  ];

  // Handle edge case where status might be custom
  const currentIdx = statusOrder.indexOf(order.status);
  const newIdx = statusOrder.indexOf(newStatus);

  if (currentIdx !== -1 && newIdx !== -1 && newIdx > currentIdx) {
    return {
      ...order,
      status: newStatus,
      payment_status: newPayment,
      paymentStatus: newPayment,
      _isSimulated: true, // Flag to indicate it was dynamically changed
    };
  }

  return order;
}

export function simulateOrderList(orders: any[]) {
  return orders.map(simulateOrderProgress);
}
