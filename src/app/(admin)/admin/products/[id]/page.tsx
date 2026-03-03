import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductEditForm } from "./ProductEditForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, description, price, compare_price, stock, unit, is_active, images, categories(name)",
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  const productData = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    compare_price: product.compare_price ? Number(product.compare_price) : null,
    stock: product.stock || 0,
    unit: product.unit,
    is_active: product.is_active,
    images: product.images || [],
    category_name: (product.categories as any)?.name || null,
  };

  return <ProductEditForm product={productData} />;
}
