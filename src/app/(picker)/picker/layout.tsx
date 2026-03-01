import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ListChecks, LogOut } from "lucide-react";

export default async function PickerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // In a real app, verify `role === 'picker'` here
    // For now, we allow access to visualize the outline.

    return (
        <div className="min-h-screen bg-secondary/20 flex flex-col">
            {/* Header */}
            <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5" />
                    <h1 className="font-bold tracking-tight">Picker Dashboard</h1>
                </div>
                <form action="/api/auth/signout" method="post">
                    <button type="submit" className="p-2 hover:bg-black/10 rounded-full transition-colors" aria-label="Sign out">
                        <LogOut className="w-4 h-4" />
                    </button>
                </form>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pb-20">
                {children}
            </main>

            {/* Bottom Mobile Navigation (Typical for warehouse workers) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 p-2 flex justify-around items-center z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <Link href="/picker" className="flex flex-col items-center p-2 text-primary">
                    <ListChecks className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium">Orders</span>
                </Link>
                {/* Add more tabs like "History" or "Settings" here later */}
            </nav>
        </div>
    );
}
