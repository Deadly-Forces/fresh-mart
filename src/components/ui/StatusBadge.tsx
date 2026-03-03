import { cn } from "@/lib/utils";

type StatusType =
  | "pending"
  | "processing"
  | "confirmed"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  pending: { label: "Pending", bg: "bg-warning/10", text: "text-warning" },
  processing: {
    label: "Processing",
    bg: "bg-warning/10",
    text: "text-warning",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-blue-500/10",
    text: "text-blue-600",
  },
  packed: { label: "Packed", bg: "bg-blue-500/10", text: "text-blue-600" },
  out_for_delivery: {
    label: "Out for Delivery",
    bg: "bg-purple-500/10",
    text: "text-purple-600",
  },
  delivered: { label: "Delivered", bg: "bg-success/10", text: "text-success" },
  cancelled: {
    label: "Cancelled",
    bg: "bg-destructive/10",
    text: "text-destructive",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status || "Unknown",
    bg: "bg-secondary",
    text: "text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium tracking-wide",
        config.bg,
        config.text,
        className,
      )}
    >
      <span className="capitalize">{config.label}</span>
    </span>
  );
}

export function OrderStatusBadge(props: StatusBadgeProps) {
  return <StatusBadge {...props} />;
}
