"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { updateProductAction } from "@/features/admin/actions/productActions";

interface ProductEditFormProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    compare_price: number | null;
    stock: number;
    unit: string | null;
    is_active: boolean;
    images: string[];
    category_name: string | null;
  };
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(product.price);
  const [comparePrice, setComparePrice] = useState(product.compare_price || 0);
  const [stock, setStock] = useState(product.stock);
  const [unit, setUnit] = useState(product.unit || "each");
  const [isActive, setIsActive] = useState(product.is_active);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProductAction(product.id, {
        name,
        description,
        price,
        compare_price: comparePrice || null,
        stock,
        unit,
        is_active: isActive,
      });
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        {saved && (
          <span className="text-sm text-success font-medium">
            Saved successfully!
          </span>
        )}
      </div>

      <div className="bg-card border border-border rounded-card p-6">
        <h2 className="font-heading text-lg mb-6">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={product.category_name || "Uncategorized"}
                disabled
                className="bg-secondary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Enter product description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparePrice">Compare Price ($)</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                min={0}
                value={comparePrice}
                onChange={(e) => setComparePrice(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Product is active
            </Label>
          </div>

          {/* Preview image */}
          {product.images[0] && (
            <div className="space-y-2">
              <Label>Current Image</Label>
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-md border"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="w-4 h-4" />
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Link href="/admin/products">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
