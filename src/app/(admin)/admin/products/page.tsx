import Link from "next/link";
import {
  Plus,
  Search,
  Download,
  Upload,
  Package,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/server";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { DeleteProductButton, InlineStockEditor } from "./ProductActions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageRaw = typeof params?.page === "string" ? params.page : "1";
  const currentPage = Math.max(1, parseInt(pageRaw, 10) || 1);
  const supabase = await createClient();

  // Get total count efficiently (no data transfer)
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { data: totalStock } = await supabase.rpc("get_total_stock" as any);

  const { count: lowStockProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .lte("stock", 10);

  // Fetch only the current page of products
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: productsData } = await supabase
    .from("products")
    .select("id, name, price, stock, is_active, images, categories(name)")
    .order("created_at", { ascending: false })
    .range(from, to);

  const products = (productsData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    category: p.categories?.name || "Uncategorized",
    price: Number(p.price || 0),
    stock: p.stock ?? 0,
    active: p.is_active !== false,
    image_url: p.images?.[0] || null,
  }));

  const total = totalProducts ?? 0;
  const activeStock = Number(totalStock ?? 0);
  const lowStock = lowStockProducts ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <AutoRefresh intervalMs={30000} tables={["products", "categories"]} />
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeStock.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Active Stock</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{lowStock}</p>
            <p className="text-xs text-muted-foreground">Low Stock (&le;10)</p>
          </div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9 h-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Link href="/admin/products/new">
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-4 py-3 text-left">
                  <Checkbox />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Product
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Price
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Stock
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
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Checkbox />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-md shrink-0 border"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-secondary rounded-md shrink-0 border" />
                        )}
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.category}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ₹{p.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <InlineStockEditor
                        productId={p.id}
                        currentStock={p.stock}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`w-2 h-2 rounded-full inline-block mr-1.5 ${p.active ? "bg-success" : "bg-muted"}`}
                      />
                      <span className="text-xs">
                        {p.active ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton
                          productId={p.id}
                          productName={p.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer with count and pagination */}
        <div className="px-4 py-3 border-t border-border bg-secondary/30 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            Showing {from + 1}–{Math.min(from + products.length, total)} of{" "}
            {total} products
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {currentPage > 1 && (
                <Link href={`/admin/products?page=${currentPage - 1}`}>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }
                return (
                  <Link key={pageNum} href={`/admin/products?page=${pageNum}`}>
                    <Button
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      className="h-7 w-7 p-0 text-xs"
                    >
                      {pageNum}
                    </Button>
                  </Link>
                );
              })}
              {currentPage < totalPages && (
                <Link href={`/admin/products?page=${currentPage + 1}`}>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
