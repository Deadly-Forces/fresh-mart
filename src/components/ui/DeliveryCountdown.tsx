"use client";

import { useEffect, useState } from "react";
import { Truck, Clock, CheckCircle2 } from "lucide-react";

interface DeliveryCountdownProps {
  createdAt: string;
  status: string;
  deliveryMinutes?: number;
}

export function DeliveryCountdown({
  createdAt,
  status,
  deliveryMinutes = 13,
}: DeliveryCountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isDelivered, setIsDelivered] = useState(status === "delivered");

  useEffect(() => {
    if (status === "delivered" || status === "cancelled") {
      setIsDelivered(status === "delivered");
      return;
    }

    const update = () => {
      const created = new Date(createdAt).getTime();
      const deadline = created + deliveryMinutes * 60 * 1000;
      const remaining = deadline - Date.now();

      if (remaining <= 0) {
        setIsDelivered(true);
        setTimeLeft("");
        // Refresh the page to pick up updated DB status
        window.location.reload();
        return;
      }

      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs.toString().padStart(2, "0")}s`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt, status, deliveryMinutes]);

  if (status === "cancelled") return null;

  if (isDelivered) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Delivered</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
      <Truck className="w-3.5 h-3.5 animate-bounce" />
      <Clock className="w-3 h-3" />
      <span>{timeLeft}</span>
    </div>
  );
}
