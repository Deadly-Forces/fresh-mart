import Link from "next/link";
import { User, LogOut, LayoutDashboard, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Suspense } from "react";
import { SearchBar } from "./SearchBar";
import { CartButton } from "./CartButton";
import { WishlistButton } from "./WishlistButton";
import { MobileMenu } from "./MobileMenu";
import { createClient } from "@/lib/supabase/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary transition-colors">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt={profile.name || "User"}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 rounded-xl p-1.5 shadow-lg border-border/50"
                >
                  <div className="px-3 py-2.5 mb-1">
                    <p className="text-sm font-semibold truncate">
                      {profile?.name || "Account"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg cursor-pointer text-sm py-2.5 px-3"
                  >
                    <Link href="/profile" className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg py-2.5 px-3">
                    <form
                      action="/api/auth/signout"
                      method="post"
                      className="w-full"
                    >
                      <button className="w-full text-left flex items-center gap-2.5 text-destructive cursor-pointer text-sm">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
