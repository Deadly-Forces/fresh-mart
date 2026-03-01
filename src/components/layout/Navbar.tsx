import Link from "next/link";
import { ShoppingCart, User, Menu, LogOut, LayoutDashboard, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Suspense } from "react";
import { SearchBar } from "./SearchBar";
import { CartButton } from "./CartButton";
import { WishlistButton } from "./WishlistButton";
import { createClient } from "@/lib/supabase/server";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export async function Navbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="lg:hidden -ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Open menu">
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
                                <Suspense fallback={<div className="h-10 w-full bg-secondary rounded-lg animate-pulse" />}>
                                    <SearchBar mobile />
                                </Suspense>
                            </div>

                            {/* Mobile nav links */}
                            <nav className="flex-1 overflow-y-auto px-4 py-3">
                                <Link href="/category/fruits" className="flex items-center px-3 py-3 rounded-lg text-[15px] font-medium text-foreground/80 hover:text-foreground hover:bg-secondary transition-colors">
                                    Fresh Fruits
                                </Link>
                                <Link href="/category/vegetables" className="flex items-center px-3 py-3 rounded-lg text-[15px] font-medium text-foreground/80 hover:text-foreground hover:bg-secondary transition-colors">
                                    Vegetables
                                </Link>
                                <Link href="/category/dairy-eggs" className="flex items-center px-3 py-3 rounded-lg text-[15px] font-medium text-foreground/80 hover:text-foreground hover:bg-secondary transition-colors">
                                    Dairy & Eggs
                                </Link>
                            </nav>

                            {/* Mobile footer */}
                            <div className="px-6 py-5 border-t border-border/50 mt-auto">
                                {user ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="User" className="w-9 h-9 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-semibold truncate">{profile?.name || "Account"}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href="/profile" className="flex-1">
                                                <Button variant="secondary" size="sm" className="w-full gap-1.5 text-xs">
                                                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                                                </Button>
                                            </Link>
                                            <form action="/api/auth/signout" method="post">
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs">
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

                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300">
                            <Leaf className="w-5 h-5 fill-white/20" strokeWidth={2.5} />
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-foreground">FreshMart</span>
                    </Link>
                </div>

                {/* Right: Search + Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Suspense fallback={<div className="hidden md:block w-[220px] h-9" />}>
                        <SearchBar />
                    </Suspense>



                    {user ? (
                        <div className="hidden sm:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary transition-colors">
                                        {profile?.avatar_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={profile.avatar_url} alt={profile.name || "User"} className="w-7 h-7 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-3.5 h-3.5 text-primary" />
                                            </div>
                                        )}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-lg border-border/50">
                                    <div className="px-3 py-2.5 mb-1">
                                        <p className="text-sm font-semibold truncate">{profile?.name || "Account"}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-sm py-2.5 px-3">
                                        <Link href="/profile" className="flex items-center gap-2.5">
                                            <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="rounded-lg py-2.5 px-3">
                                        <form action="/api/auth/signout" method="post" className="w-full">
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
                        <Link href="/login" className="hidden sm:flex">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-medium h-9 px-3">
                                <User className="w-4 h-4" />
                                Sign In
                            </Button>
                        </Link>
                    )}

                    <div className="flex items-center gap-1">
                        <WishlistButton />
                        <CartButton />
                    </div>
                </div>
            </div>
        </header>
    );
}
