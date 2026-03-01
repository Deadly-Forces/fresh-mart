import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Navigation2, LogOut } from "lucide-react";

export default async function RiderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // In a real app, verify `role === 'rider'` here

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-blue-600 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                    <Navigation2 className="w-5 h-5 fill-current" />
                    <h1 className="font-bold tracking-tight">Rider App</h1>
                </div>
                <form action="/api/auth/signout" method="post">
                    <button type="submit" title="Log Out" aria-label="Log Out" className="p-2 hover:bg-black/10 rounded-full transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </form>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pb-20">
                {children}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around items-center z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                <Link href="/rider" className="flex flex-col items-center p-2 text-blue-600">
                    <Navigation2 className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium">Deliveries</span>
                </Link>
            </nav>
        </div>
    );
}
