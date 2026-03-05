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
  deliveryMinutes = 15,
}: DeliveryCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [countdownDone, setCountdownDone] = useState(false);

  // Only render after mount to avoid hydration mismatch (Date.now() differs server/client)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "delivered" || status === "cancelled") return;

    const created = new Date(createdAt).getTime();
    const deadline = created + deliveryMinutes * 60 * 1000;

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
  }, [createdAt, status, deliveryMinutes, mounted]);

  // Return nothing during SSR to avoid hydration mismatch
  if (!mounted) return null;

  if (status === "cancelled") return null;

  const isEffectivelyDelivered = status === "delivered" || countdownDone;

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
