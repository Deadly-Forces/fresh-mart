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
  // Optimistically show "Delivered" once the countdown reaches zero.
  // The real DB status is shown via the `status` prop on next page load.
  const [countdownDone, setCountdownDone] = useState(false);

  const isEffectivelyDelivered = status === "delivered" || countdownDone;

  useEffect(() => {
    // Already delivered / cancelled — nothing to do
    if (status === "delivered" || status === "cancelled") return;

    const created = new Date(createdAt).getTime();
    const deadline = created + deliveryMinutes * 60 * 1000;

    // If already past deadline on mount, mark done immediately (no interval)
    if (Date.now() >= deadline) {
      setCountdownDone(true);
      return;
    }

    const tick = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        setCountdownDone(true);
        setTimeLeft("");
        clearInterval(id);
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs.toString().padStart(2, "0")}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt, status, deliveryMinutes]);

  if (status === "cancelled") return null;

  if (isEffectivelyDelivered) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Delivered</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
      <span className="inline-flex animate-bounce">
        <Truck className="w-3.5 h-3.5" />
      </span>
      <Clock className="w-3 h-3" />
      <span>{timeLeft}</span>
    </div>
  );
}
