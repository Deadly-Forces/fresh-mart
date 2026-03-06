import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { CategoryStrip } from "@/components/layout/CategoryStrip";
import { Footer } from "@/components/layout/Footer";
import { CartSyncProvider } from "@/components/providers/CartSyncProvider";
import { WishlistSyncProvider } from "@/components/providers/WishlistSyncProvider";

export const dynamic = "force-dynamic";

function NavbarFallback() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-b border-border/50 z-50 flex items-center">
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500" />
          <span className="font-semibold text-lg tracking-tight text-foreground">
            FreshMart
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:block w-[220px] h-9 rounded-lg bg-secondary/50" />
        </div>
      </div>
    </header>
  );
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen" suppressHydrationWarning>
      <CartSyncProvider />
      <WishlistSyncProvider />
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <div className="pt-16">
        <CategoryStrip />
      </div>
      <main className="flex-1 bg-background">{children}</main>
      <Footer />
    </div>
  );
}
