import Link from "next/link";
import { User, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Suspense } from "react";
import { SearchBar } from "./SearchBar";
import { CartButton } from "./CartButton";
import { WishlistButton } from "./WishlistButton";
import { MobileMenu } from "./MobileMenu";
import { UserMenu } from "./UserMenu";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-b border-border/50 z-50 flex items-center transition-colors">
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between gap-6">
        {/* Left: Logo + Mobile menu trigger */}
        <div className="flex items-center gap-3">
          <MobileMenu user={user} profile={profile} />

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300">
              <Leaf className="w-5 h-5 fill-white/20" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">
              FreshMart
            </span>
          </Link>
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Suspense
            fallback={<div className="hidden md:block w-[220px] h-9" />}
          >
            <SearchBar />
          </Suspense>

          <WishlistButton />

          {user ? (
            <UserMenu
              email={user.email}
              name={profile?.name ?? null}
              avatarUrl={profile?.avatar_url ?? null}
            />
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:flex gap-1.5 text-sm font-medium h-9 px-3"
            >
              <Link href="/login">
                <User className="w-4 h-4" />
                Sign In
              </Link>
            </Button>
          )}

          <CartButton />
        </div>
      </div>
    </header>
  );
}
