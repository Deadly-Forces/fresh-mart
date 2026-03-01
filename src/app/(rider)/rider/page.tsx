import Link from "next/link";
import { MapPin, Box, ArrowRight } from "lucide-react";

export default function RiderDashboard() {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
                Ready for Pickup
            </h2>

            {/* Mock Order Card for Rider */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-slate-900">Order #ORD-2026-98X</h3>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                            <Box className="w-3.5 h-3.5" /> 2 Bags
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100 flex items-start gap-3">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Drop-off</p>
                        <p className="text-sm font-medium text-slate-800">123 Fresh Lane, Apt 4B</p>
                        <p className="text-xs text-slate-500">2.4 miles away</p>
                    </div>
                </div>

                <Link
                    href="#"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                    Start Delivery
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
