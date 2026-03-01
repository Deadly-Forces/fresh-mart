"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProductAction, updateProductStockAction } from "@/features/admin/actions/productActions";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm(`Are you sure you want to delete "${productName}"? This cannot be undone.`)) return;

        startTransition(async () => {
            const result = await deleteProductAction(productId);
            if (result.error) {
                alert(`Error: ${result.error}`);
            } else {
                router.refresh();
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
            {isPending ? "..." : "Delete"}
        </button>
    );
}

export function InlineStockEditor({ productId, currentStock }: { productId: string; currentStock: number }) {
    const [editing, setEditing] = useState(false);
    const [stock, setStock] = useState(currentStock);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateProductStockAction(productId, stock);
            if (result.error) {
                alert(`Error: ${result.error}`);
                setStock(currentStock);
            } else {
                router.refresh();
            }
            setEditing(false);
        });
    };

    if (editing) {
        return (
            <div className="flex items-center gap-1">
                <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-16 h-7 px-2 text-xs border border-border rounded bg-background"
                    autoFocus
                    title="Edit stock quantity"
                    placeholder="Stock"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") { setEditing(false); setStock(currentStock); }
                    }}
                />
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="text-[10px] text-primary hover:underline"
                >
                    {isPending ? "..." : "Save"}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setEditing(true)}
            className={`cursor-pointer hover:underline ${currentStock <= 5 ? "text-destructive font-bold" : ""}`}
            title="Click to edit stock"
        >
            {currentStock}
        </button>
    );
}
