"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Plus, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { createProductAction } from "@/features/admin/actions/productActions";

interface AddProductFormProps {
  categories: { id: string; name: string }[];
}

export function AddProductForm({ categories }: AddProductFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [comparePrice, setComparePrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [unit, setUnit] = useState("each");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 200);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  const addImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      setError("Please enter a valid image URL.");
      return;
    }
    if (images.length >= 10) {
      setError("Maximum 10 images allowed.");
      return;
    }
    setImages([...images, trimmed]);
    setNewImageUrl("");
    setError("");
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAutoFillClick = () => {
    fileInputRef.current?.click();
  };

  const handleAutoFillFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError("AI analysis requires images under 4MB.");
      return;
    }

    setIsAiLoading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        const res = await fetch("/api/ai/auto-catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64,
            categories
          })
        });

        if (!res.ok) {
          setError("Failed to auto-catalog the product from image.");
          setIsAiLoading(false);
          return;
        }

        const data = await res.json();

        if (data.name) handleNameChange(data.name);
        if (data.description) setDescription(data.description);
        if (data.price) setPrice(data.price);
        if (data.unit) setUnit(data.unit);
        if (data.categoryId) setCategoryId(data.categoryId);
        setIsAiLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("An error occurred during AI analysis.");
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (price <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    startTransition(async () => {
      const result = await createProductAction({
        name: name.trim(),
        slug: slug || generateSlug(name),
        description: description.trim() || undefined,
        price,
        compare_price: comparePrice || null,
        stock,
        unit: unit.trim() || undefined,
        category_id: categoryId || null,
        is_active: isActive,
        images,
      });
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/products");
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
      </div>

      <div className="bg-card border border-border rounded-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg">Add New Product</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAutoFillClick}
            disabled={isAiLoading}
            className="gap-2 bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            {isAiLoading ? "Analyzing Image..." : "Auto-Fill with AI"}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleAutoFillFileChange}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Fresh Organic Tomatoes"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="fresh-organic-tomatoes"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from name. Edit if needed.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              title="Product category"
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
            >
              <option value="">No Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min={0}
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparePrice">Compare Price (₹)</Label>
              <Input
                id="comparePrice"
                type="number"
                step="0.01"
                min={0}
                value={comparePrice || ""}
                onChange={(e) => setComparePrice(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
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
                placeholder="each, kg, pack"
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

          {/* Image URLs */}
          <div className="space-y-3">
            <Label>Product Images</Label>
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImage}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Product image ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      title="Remove image"
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Add image URLs. Up to 10 images.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="w-4 h-4" />
              {isPending ? "Creating..." : "Create Product"}
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
