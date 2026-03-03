"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBanner, updateBanner, deleteBanner } from "./actions";

type Banner = {
  id: string;
  title: string;
  link: string;
  image_url: string | null;
  active: boolean;
  dates: string;
  rawSortOrder: number;
  rawStartsAt: string | null;
  rawEndsAt: string | null;
};

export function BannerManager({ banners }: { banners: Banner[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const openAdd = () => {
    setEditingBanner(null);
    setError("");
    setShowModal(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = editingBanner
        ? await updateBanner(editingBanner.id, formData)
        : await createBanner(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setShowModal(false);
        setEditingBanner(null);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteBanner(id);
      setDeleteId(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button size="sm" className="gap-1" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-card border border-border rounded-card p-8 text-center text-muted-foreground">
          <p className="text-sm">
            No banners found. Add your first banner to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-4 bg-card border border-border rounded-card p-4"
            >
              <span className="text-muted-foreground">⠿</span>
              {b.image_url ? (
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="w-24 h-14 object-cover rounded-md shrink-0 border"
                />
              ) : (
                <div className="w-24 h-14 bg-secondary rounded-md shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                  Preview
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{b.title}</p>
                <p className="text-xs text-muted-foreground">
                  {b.link} • {b.dates}
                </p>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${b.active ? "bg-success" : "bg-muted"}`}
              />
              <button
                onClick={() => openEdit(b)}
                className="text-xs text-primary hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteId(b.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {editingBanner ? "Edit Banner" : "Add Banner"}
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
                <label className="text-sm font-medium">Title</label>
                <input
                  name="title"
                  required
                  defaultValue={editingBanner?.title || ""}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                  placeholder="Summer Sale Banner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <input
                  name="image_url"
                  defaultValue={editingBanner?.image_url || ""}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link</label>
                  <input
                    name="link"
                    defaultValue={editingBanner?.link || "/shop"}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                    placeholder="/shop"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort Order</label>
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={editingBanner?.rawSortOrder || 0}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Starts At</label>
                  <input
                    name="starts_at"
                    type="datetime-local"
                    aria-label="Starts At"
                    defaultValue={
                      editingBanner?.rawStartsAt
                        ? new Date(editingBanner.rawStartsAt)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ends At</label>
                  <input
                    name="ends_at"
                    type="datetime-local"
                    aria-label="Ends At"
                    defaultValue={
                      editingBanner?.rawEndsAt
                        ? new Date(editingBanner.rawEndsAt)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
              </div>

              {editingBanner && (
                <div className="flex items-center gap-2">
                  <input
                    type="hidden"
                    name="is_active"
                    value={editingBanner.active ? "true" : "false"}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={editingBanner.active}
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
                    : editingBanner
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
            <h3 className="font-bold text-lg mb-2">Delete Banner?</h3>
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
