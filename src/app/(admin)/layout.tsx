"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/config/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className={cn(
                "bg-admin-sidebar text-white flex flex-col transition-all duration-300 shrink-0 sticky top-0 h-screen",
                collapsed ? "w-16" : "w-60"
            )}>
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-white/10">
                    {!collapsed && <span className="font-heading text-xl text-white tracking-tight">FreshMart</span>}
                    {collapsed && <span className="font-heading text-xl text-white mx-auto">F</span>}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-2 space-y-1">
                    {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Toggle */}
                <div className="p-2 border-t border-white/10">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-button text-sm text-white/70 hover:bg-white/10 transition-colors"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
                    </button>
                </div>
            </aside>

            {/* Content */}
            <div className="flex-1 flex flex-col bg-secondary/30 min-w-0">
                {/* Top bar */}
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
                    <h2 className="text-lg font-semibold capitalize">
                        {pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            A
                        </div>
                        <span className="text-sm font-medium hidden sm:block">Admin</span>
                    </div>
                </header>

                {/* Main */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
