import Link from "next/link";
import { Clock, CheckCircle2, ChevronRight } from "lucide-react";

export default function PickerDashboard() {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent mb-2">
                Unassigned Orders
            </h2>

            {/* Mock Order Card for Picker */}
            <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-foreground">Order #ORD-2026-98X</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">14 items • Aisle 2, 5, 8</p>
                    </div>
                    <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due in 45m
                    </span>
                </div>

                <Link
                    href="#"
                    className="mt-4 w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 group"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Order
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                <p>No more pending orders.</p>
            </div>
        </div>
    );
}
