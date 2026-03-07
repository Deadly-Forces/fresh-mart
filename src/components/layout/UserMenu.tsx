"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  email: string | undefined;
  name: string | null;
  avatarUrl: string | null;
}

export function UserMenu({ email, name, avatarUrl }: UserMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a static button during SSR to avoid Radix useId hydration mismatch
  if (!mounted) {
    return (
      <div className="hidden sm:block">
        <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary transition-colors">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name || "User"}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="hidden sm:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary transition-colors">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={name || "User"}
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
              {name || "Account"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
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
  );
}
