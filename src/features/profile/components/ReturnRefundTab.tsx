"use client";

import { useState, useEffect } from "react";
import {
  RotateCcw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getReturnRequestsAction,
  createReturnRequestAction,
} from "@/features/profile/actions/returnActions";
import { UserOrder } from "@/types";

interface ReturnRequest {
  id: string;
  order_id: string;
  reason: string;
  description: string | null;
  status: string;
  refund_amount: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ReturnRefundTabProps {
  orders: UserOrder[];
}

const REASON_LABELS: Record<string, string> = {
  damaged: "Damaged Items",
  wrong_item: "Wrong Item Received",
  quality: "Quality Issues",
  missing_item: "Missing Items",
  other: "Other",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof Clock; color: string; bg: string }
> = {
  pending: { label: "Under Review", icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-500/10" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  refunded: { label: "Refunded", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
};

export function ReturnRefundTab({ orders }: ReturnRefundTabProps) {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const result = await getReturnRequestsAction();
    if (!result.error) {
      setRequests((result.requests as unknown as ReturnRequest[]) ?? []);
    }
    setLoading(false);
  };

  // Orders that already have a return request
  const ordersWithReturn = new Set(requests.map((r) => r.order_id));

  // Eligible orders: delivered + no existing return request
  const eligibleOrders = deliveredOrders.filter(
    (o) => !ordersWithReturn.has(o.id)
  );

  const handleSubmit = async () => {
    if (!selectedOrderId) {
      toast.error("Please select an order.");
      return;
    }
    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("orderId", selectedOrderId);
    formData.set("reason", reason);
    formData.set("description", description);

    const result = await createReturnRequestAction(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Return request submitted successfully!");
      setDialogOpen(false);
      setSelectedOrderId("");
      setReason("");
      setDescription("");
      loadRequests();
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold">
                  Returns & Refunds
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Request returns for delivered orders within 24 hours of delivery.
                  We&apos;ll review and process your refund quickly.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              disabled={eligibleOrders.length === 0}
              className="gap-2 font-semibold h-11 px-6 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              Request Return
            </Button>
          </div>

          {eligibleOrders.length === 0 && deliveredOrders.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center gap-2 text-sm text-amber-600">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              All delivered orders already have return requests.
            </div>
          )}
        </div>
      </div>

      {/* Return Requests List */}
      {requests.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary/30" />
          </div>
          <h3 className="text-xl font-heading font-bold mb-2">
            No return requests
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            If you have any issues with a delivered order, you can request a
            return from here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            const isExpanded = expandedId === req.id;

            return (
              <div
                key={req.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className={`h-1 ${
                  req.status === "refunded"
                    ? "bg-gradient-to-r from-emerald-400 to-green-500"
                    : req.status === "rejected"
                      ? "bg-gradient-to-r from-red-400 to-red-500"
                      : req.status === "approved"
                        ? "bg-gradient-to-r from-blue-400 to-blue-500"
                        : "bg-gradient-to-r from-amber-400 to-yellow-500"
                }`} />
                <button
                  className="w-full p-5 flex items-center justify-between gap-4 text-left"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : req.id)
                  }
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full ${status.bg} flex items-center justify-center shrink-0`}
                    >
                      <StatusIcon className={`w-5 h-5 ${status.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        Order #{req.order_id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {REASON_LABELS[req.reason] ?? req.reason} &middot;{" "}
                        {new Date(req.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-border/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {req.description && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Description
                        </p>
                        <p className="text-sm">{req.description}</p>
                      </div>
                    )}
                    {req.refund_amount != null && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Refund Amount
                        </p>
                        <p className="text-lg font-bold text-primary">
                          ₹
                          {Number(req.refund_amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    )}
                    {req.admin_notes && (
                      <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Admin Response
                        </p>
                        <p className="text-sm">{req.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Return Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-500" />
              Request a Return
            </DialogTitle>
            <DialogDescription>
              Select the order and describe the issue. We&apos;ll review your
              request within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Select Order <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedOrderId}
                onValueChange={setSelectedOrderId}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose a delivered order" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      #{order.id.slice(0, 8).toUpperCase()} — ₹
                      {order.total.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      ({new Date(order.created_at).toLocaleDateString("en-IN")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="damaged">
                    📦 Damaged Items
                  </SelectItem>
                  <SelectItem value="wrong_item">
                    🔄 Wrong Item Received
                  </SelectItem>
                  <SelectItem value="quality">
                    ⚠️ Quality Issues
                  </SelectItem>
                  <SelectItem value="missing_item">
                    ❌ Missing Items
                  </SelectItem>
                  <SelectItem value="other">
                    📝 Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/1000
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedOrderId || !reason}
              className="gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
