"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCoupon, updateCoupon, deleteCoupon } from "./actions";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  perUserLimit: number | null;
  description: string;
  uses: string;
  expiry: string;
  active: boolean;
  rawMaxUses: number | null;
  rawExpiresAt: string | null;
};

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const openAdd = () => {
    setEditingCoupon(null);
    setError("");
    setShowModal(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = editingCoupon
        ? await updateCoupon(editingCoupon.id, formData)
        : await createCoupon(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setShowModal(false);
        setEditingCoupon(null);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteCoupon(id);
      setDeleteId(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button size="sm" className="gap-1" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Coupon
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Code
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Value
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Min. Order
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Max Disc.
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Uses
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Per User
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Expiry
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No coupons found. Create your first coupon to get started.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono font-bold text-primary">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {c.type}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      ₹{c.minOrder}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.maxDiscount !== null ? `₹${c.maxDiscount}` : "—"}
                    </td>
                    <td className="px-4 py-3">{c.uses}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.perUserLimit !== null ? c.perUserLimit : "∞"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.expiry}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`w-2 h-2 rounded-full inline-block mr-1.5 ${c.active ? "bg-success" : "bg-muted"}`}
                      />
                      <span className="text-xs">
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-xs text-primary hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {editingCoupon ? "Edit Coupon" : "Add Coupon"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code</label>
                <input
                  name="code"
                  required
                  defaultValue={editingCoupon?.code || ""}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm uppercase"
                  placeholder="SAVE20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <input
                  name="description"
                  defaultValue={editingCoupon?.description || ""}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                  placeholder="e.g. Welcome bonus for new users"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    name="type"
                    aria-label="Coupon Type"
                    defaultValue={editingCoupon?.type || "percentage"}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  <input
                    name="value"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingCoupon?.value || ""}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min. Order (₹)</label>
                  <input
                    name="min_order"
                    type="number"
                    step="0.01"
                    defaultValue={editingCoupon?.minOrder || 0}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Discount (₹)</label>
                  <input
                    name="max_discount"
                    type="number"
                    step="0.01"
                    defaultValue={editingCoupon?.maxDiscount ?? ""}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                    placeholder="No cap"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Uses</label>
                  <input
                    name="max_uses"
                    type="number"
                    defaultValue={editingCoupon?.rawMaxUses || ""}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Per User Limit</label>
                  <input
                    name="per_user_limit"
                    type="number"
                    defaultValue={editingCoupon?.perUserLimit ?? ""}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Date</label>
                <input
                  name="expires_at"
                  type="datetime-local"
                  aria-label="Expiry Date"
                  defaultValue={
                    editingCoupon?.rawExpiresAt
                      ? new Date(editingCoupon.rawExpiresAt)
                        .toISOString()
                        .slice(0, 16)
                      : ""
                  }
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>

              {editingCoupon && (
                <div className="flex items-center gap-2">
                  <input
                    type="hidden"
                    name="is_active"
                    value={editingCoupon.active ? "true" : "false"}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={editingCoupon.active}
                      onChange={(e) => {
                        const hidden = e.target
                          .closest("div")
                          ?.querySelector(
                            'input[name="is_active"]',
                          ) as HTMLInputElement;
                        if (hidden)
                          hidden.value = e.target.checked ? "true" : "false";
                      }}
                      className="rounded"
                    />
                    Active
                  </label>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending
                    ? "Saving..."
                    : editingCoupon
                      ? "Update"
                      : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
            <h3 className="font-bold text-lg mb-2">Delete Coupon?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={isPending}
                onClick={() => handleDelete(deleteId)}
              >
                {isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
