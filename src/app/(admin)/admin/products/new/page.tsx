import { createClient } from "@/lib/supabase/server";
import { AddProductForm } from "./AddProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createClient();

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const categories = (categoriesData || []).map((c: any) => ({
    id: c.id,
    name: c.name,
  }));

  return <AddProductForm categories={categories} />;
}
