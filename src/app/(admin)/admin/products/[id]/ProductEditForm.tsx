"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Plus, X, GripVertical, Heart } from "lucide-react";
import Link from "next/link";
import { updateProductAction, updateProductImagesAction } from "@/features/admin/actions/productActions";

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
    wishlistCount: number;
  };
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const { wishlistCount } = product;
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(product.price);
  const [comparePrice, setComparePrice] = useState(product.compare_price || 0);
  const [stock, setStock] = useState(product.stock);
  const [unit, setUnit] = useState(product.unit || "each");
  const [isActive, setIsActive] = useState(product.is_active);
  const [images, setImages] = useState<string[]>(product.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isImagesPending, startImagesTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [imageError, setImageError] = useState("");
  const router = useRouter();

  const addImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      setImageError("Please enter a valid URL.");
      return;
    }
    if (images.length >= 10) {
      setImageError("Maximum 10 images allowed.");
      return;
    }
    setImages([...images, trimmed]);
    setNewImageUrl("");
    setImageError("");
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setImages(updated);
  };

  const saveImages = () => {
    setImageError("");
    startImagesTransition(async () => {
      const result = await updateProductImagesAction(product.id, images);
      if (result.error) {
        setImageError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    });
  };

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg">Edit Product</h2>
          {wishlistCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium">
              <Heart className="w-4 h-4 fill-current" /> {wishlistCount} wishlisted
            </span>
          )}
        </div>
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

          {/* Image Management */}
          <div className="space-y-3">
            <Label>Product Images</Label>
            {imageError && (
              <p className="text-sm text-destructive">{imageError}</p>
            )}
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addImage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {images.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative group border rounded-md p-1">
                    <img
                      src={url}
                      alt={`Product image ${i + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        title="Remove image"
                        className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex justify-center gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => moveImage(i, i - 1)}
                        disabled={i === 0}
                        title="Move left"
                        className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        ←
                      </button>
                      <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => moveImage(i, i + 1)}
                        disabled={i === images.length - 1}
                        title="Move right"
                        className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={saveImages}
              disabled={isImagesPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isImagesPending ? "Saving Images..." : "Save Images"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Add image URLs and reorder with arrows. Up to 10 images. Save images separately.
            </p>
          </div>

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
