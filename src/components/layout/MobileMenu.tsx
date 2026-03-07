"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Suspense } from "react";
import {
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Leaf,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./SearchBar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileMenuProps {
  user: { email?: string } | null;
  profile: { name: string | null; avatar_url: string | null } | null;
}

export function MobileMenu({ user, profile }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a static button during SSR to avoid Radix useId hydration mismatch
  if (!mounted) {
    return (
      <button
        className="lg:hidden -ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="lg:hidden -ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-border/50 text-left">
          <SheetTitle className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-md">
              <Leaf className="w-4 h-4 fill-white/20" />
            </div>
            FreshMart
          </SheetTitle>
        </SheetHeader>

        {/* Mobile search */}
        <div className="px-6 pt-5 pb-2">
          <Suspense
            fallback={
              <div className="w-full h-10 rounded-lg bg-secondary/50 animate-pulse" />
            }
          >
            <SearchBar mobile />
          </Suspense>
        </div>

        {/* Mobile nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-3">
          <Link
            href="/assistant"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] font-medium text-primary hover:text-primary hover:bg-secondary transition-colors"
          >
            <ChefHat className="w-5 h-5" />
            Cooking Assistant
          </Link>
          <div className="h-px bg-border/50 my-2 mx-3" />
          {[
            { name: "Fresh Fruits", slug: "fruits" },
            { name: "Vegetables", slug: "vegetables" },
            { name: "Dairy & Eggs", slug: "dairy-eggs" },
            { name: "Bakery", slug: "bakery" },
            { name: "Meat & Seafood", slug: "meat-seafood" },
            { name: "Cooking Essentials", slug: "cooking-essentials" },
            { name: "Spices & Seasonings", slug: "spices-seasonings" },
            { name: "Staples", slug: "staples" },
            { name: "Snacks", slug: "snacks" },
            { name: "Beverages", slug: "beverages" },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex items-center px-3 py-3 rounded-lg text-[15px] font-medium text-foreground/80 hover:text-foreground hover:bg-secondary transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Mobile footer */}
        <div className="px-6 py-5 border-t border-border/50 mt-auto">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt="User"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">
                    {profile?.name || "Account"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/profile" className="flex-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Button>
                </Link>
                <form action="/api/auth/signout" method="post">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button className="w-full gap-2 h-10">
                <User className="w-4 h-4" /> Sign In
              </Button>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
