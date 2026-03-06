"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { updateReturnRequestAction } from "@/features/admin/actions/returnActions";
import { X, Sparkles } from "lucide-react";

interface ReturnRequest {
    id: string;
    orderId: string;
    orderShortId: string;
    orderTotal: number;
    orderStatus: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    reason: string;
    description: string;
    status: string;
    refundAmount: number | null;
    adminNotes: string;
    items?: any | null;
    createdAt: string;
    updatedAt: string;
}

export function ReturnsClient({ requests }: { requests: ReturnRequest[] }) {
    const [filter, setFilter] = useState("all");
    const [selected, setSelected] = useState<ReturnRequest | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [refundAmount, setRefundAmount] = useState("");
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

    function openReview(r: ReturnRequest) {
        setSelected(r);
        setNewStatus(r.status);
        setAdminNotes(r.adminNotes || "");
        setRefundAmount(r.refundAmount?.toString() || r.orderTotal.toString());
        setMessage("");
    }

    function closeReview() {
        setSelected(null);
        setMessage("");
    }

    function handleSave() {
        if (!selected) return;
        startTransition(async () => {
            const result = await updateReturnRequestAction(
                selected.id,
                newStatus,
                adminNotes || undefined,
                newStatus === "refunded" ? Number(refundAmount) || 0 : undefined,
            );
            if (result.error) {
                setMessage(`Error: ${result.error}`);
            } else {
                setMessage("Updated successfully.");
                setTimeout(() => {
                    closeReview();
                    router.refresh();
                }, 600);
            }
        });
    }

    return (
        <>
            <div className="bg-card border border-border rounded-card overflow-hidden">
                {/* Filter tabs */}
                <div className="border-b border-border px-4 py-3 flex gap-2 flex-wrap">
                    {["all", "pending", "approved", "refunded", "rejected"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${filter === s
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/40"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-secondary/30 text-muted-foreground border-b border-border text-xs">
                                <th className="px-4 py-3 text-left font-medium">Order</th>
                                <th className="px-4 py-3 text-left font-medium">Customer</th>
                                <th className="px-4 py-3 text-left font-medium">Reason</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Refund</th>
                                <th className="px-4 py-3 text-right font-medium">Date</th>
                                <th className="px-4 py-3 text-center font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                        No return requests found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((r) => (
                                    <tr key={r.id} className="hover:bg-secondary/10 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs font-medium">#{r.orderShortId}</span>
                                            <p className="text-xs text-muted-foreground">₹{r.orderTotal.toFixed(2)}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-foreground">{r.customerName}</p>
                                            <p className="text-xs text-muted-foreground">{r.customerEmail}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-foreground capitalize">{r.reason}</p>
                                            {r.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                                    {r.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={r.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {r.refundAmount !== null ? (
                                                <span className="font-semibold text-emerald-600">₹{r.refundAmount.toFixed(2)}</span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs text-muted-foreground" suppressHydrationWarning>
                                            {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => openReview(r)}
                                                className="px-3 py-1 text-xs font-medium rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Dialog */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-card border border-border rounded-card shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="text-lg font-heading font-semibold">Review Return Request</h3>
                            <button onClick={closeReview} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Request info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">Order</p>
                                    <p className="font-mono font-medium">#{selected.orderShortId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Order Total</p>
                                    <p className="font-semibold">₹{selected.orderTotal.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Customer</p>
                                    <p className="font-medium">{selected.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <p>{selected.customerPhone}</p>
                                </div>
                            </div>

                            <div className="text-sm">
                                <p className="text-xs text-muted-foreground mb-1">Reason</p>
                                <p className="capitalize font-medium">{selected.reason}</p>
                                {selected.description && (
                                    <p className="text-muted-foreground mt-1">{selected.description}</p>
                                )}
                            </div>

                            {/* Show Items Included */}
                            {selected.items && Array.isArray(selected.items) && selected.items.length > 0 && (
                                <div className="text-sm">
                                    <p className="text-xs text-muted-foreground mb-1">Items Included</p>
                                    <div className="bg-secondary/20 rounded-lg border border-border divide-y divide-border max-h-40 overflow-y-auto">
                                        {selected.items.map((item: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center p-2 text-xs">
                                                <span className="font-medium text-foreground truncate mr-2">
                                                    {(item.product_snapshot as any)?.name || "Unknown Product"}
                                                </span>
                                                <span className="text-muted-foreground whitespace-nowrap">
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Show AI Notes if they exist */}
                            {selected.adminNotes && selected.adminNotes.startsWith("AI") && (
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                                    <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                                        <Sparkles className="w-3.5 h-3.5" /> Agentic AI Analysis
                                    </p>
                                    <p className="text-foreground text-xs leading-relaxed">{selected.adminNotes}</p>
                                </div>
                            )}

                            {/* Status select */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Update Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    title="Return request status"
                                    className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="refunded">Refunded</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Refund amount (shown when refunded) */}
                            {newStatus === "refunded" && (
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        Refund Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={selected.orderTotal}
                                        step="0.01"
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        title="Refund amount"
                                        className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm"
                                    />
                                </div>
                            )}

                            {/* Admin notes */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Admin Notes
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm resize-none"
                                    placeholder="Optional notes about the decision..."
                                />
                            </div>

                            {message && (
                                <p className={`text-xs font-medium ${message.startsWith("Error") ? "text-destructive" : "text-success"}`}>
                                    {message}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t border-border">
                            <button
                                onClick={closeReview}
                                className="px-4 py-2 text-sm border border-border rounded-button hover:bg-secondary/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isPending ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
