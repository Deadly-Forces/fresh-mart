"use client";

import { useEffect, useMemo, useState } from "react";
import { Truck, Clock, CheckCircle2 } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";

interface DeliveryCountdownProps {
  createdAt: string;
  status: string;
  deliveryMinutes?: number;
}

function getCountdownSnapshot(
  createdAt: string,
  deliveryMinutes: number,
  now: number,
) {
  const deadline = new Date(createdAt).getTime() + deliveryMinutes * 60 * 1000;
  const remaining = deadline - now;

  if (remaining <= 0) {
    return { timeLeft: "", isComplete: true };
  }

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return {
    timeLeft: `${mins}m ${secs.toString().padStart(2, "0")}s`,
    isComplete: false,
  };
}

export function DeliveryCountdown({
  createdAt,
  status,
  deliveryMinutes = 15,
}: DeliveryCountdownProps) {
  const hydrated = useHydrated();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!hydrated) return;
    if (status === "delivered" || status === "cancelled") return;

    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, [deliveryMinutes, hydrated, status]);

  const countdown = useMemo(
    () => getCountdownSnapshot(createdAt, deliveryMinutes, now),
    [createdAt, deliveryMinutes, now],
  );

  // Return nothing during SSR to avoid hydration mismatch
  if (!hydrated) return null;

  if (status === "cancelled") return null;

  const isEffectivelyDelivered =
    status === "delivered" || countdown.isComplete;

  if (isEffectivelyDelivered) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Delivered</span>
      </div>
    );
  }

  if (!countdown.timeLeft) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
      <span className="inline-flex animate-bounce">
        <Truck className="w-3.5 h-3.5" />
      </span>
      <Clock className="w-3 h-3" />
      <span>{countdown.timeLeft}</span>
    </div>
  );
}
