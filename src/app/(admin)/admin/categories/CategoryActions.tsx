"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction, updateCategoryAction } from "@/features/admin/actions/productActions";

export function DeleteCategoryButton({ categoryId, categoryName }: { categoryId: string; categoryName: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm(`Delete "${categoryName}"? All products in this category will become uncategorized. This cannot be undone.`)) return;

        startTransition(async () => {
            const result = await deleteCategoryAction(categoryId);
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

export function ToggleCategoryButton({ categoryId, isActive }: { categoryId: string; isActive: boolean }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggle = () => {
        startTransition(async () => {
            const result = await updateCategoryAction(categoryId, { is_active: !isActive });
            if (result.error) {
                alert(`Error: ${result.error}`);
            } else {
                router.refresh();
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className="text-xs text-primary hover:underline transition-colors disabled:opacity-50"
        >
            {isPending ? "..." : isActive ? "Hide" : "Show"}
        </button>
    );
}
