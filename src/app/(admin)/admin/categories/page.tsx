import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { DeleteCategoryButton, ToggleCategoryButton } from "./CategoryActions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  // Fetch categories with product count
  const { data: categoriesData } = await supabase
    .from("categories")
    .select(
      `
            id, name, slug, is_active, image_url, sort_order,
            products(count)
        `,
    )
    .order("sort_order", { ascending: true });

  const categories = (categoriesData || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    products: Array.isArray(c.products) ? c.products[0]?.count || 0 : 0,
    active: c.is_active !== false,
    image_url: c.image_url,
  }));

  const totalCategories = categories.length;
  const totalProducts = categories.reduce((sum, c) => sum + c.products, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <AutoRefresh intervalMs={30000} tables={["categories", "products"]} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold">{totalCategories}</p>
          <p className="text-xs text-muted-foreground">Total Categories</p>
        </div>
        <div className="bg-card border border-border rounded-card p-4 text-center">
          <p className="text-2xl font-bold">{totalProducts}</p>
          <p className="text-xs text-muted-foreground">
            Total Products Across Categories
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-4 py-3 text-left w-12">#</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Image
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Slug
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Products
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
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt={c.name}
                          className="w-10 h-10 object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-secondary rounded-md border" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {c.slug}
                    </td>
                    <td className="px-4 py-3 font-semibold">{c.products}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`w-2 h-2 rounded-full inline-block mr-1.5 ${c.active ? "bg-success" : "bg-muted"}`}
                      />
                      <span className="text-xs">
                        {c.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <ToggleCategoryButton
                          categoryId={c.id}
                          isActive={c.active}
                        />
                        <DeleteCategoryButton
                          categoryId={c.id}
                          categoryName={c.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-secondary/30 text-xs text-muted-foreground">
          Showing {categories.length} categor
          {categories.length !== 1 ? "ies" : "y"}
        </div>
      </div>
    </div>
  );
}
