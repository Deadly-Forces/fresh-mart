"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, Truck, Clock, Navigation } from "lucide-react";

interface OrderTrackingMapProps {
    createdAt: string;
    status: string;
    orderId: string;
    progressPercent?: number;
}

const STATUS_LABELS: Record<string, string> = {
    pending: "Order received",
    processing: "Preparing your order",
    confirmed: "Order confirmed",
    packed: "Order packed & ready",
    out_for_delivery: "Driver is on the way!",
    delivered: "Delivered!",
    cancelled: "Order cancelled",
};

export function OrderTrackingMap({ createdAt, status, orderId, progressPercent }: OrderTrackingMapProps) {
    const [localProgress, setLocalProgress] = useState(0);
    const [eta, setEta] = useState("");
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Use passed progressPercent if available, else local calculated progress
    const progress = progressPercent !== undefined ? progressPercent / 100 : localProgress;

    // Calculate delivery ETA
    useEffect(() => {
        if (status === "delivered" || status === "cancelled") {
            setLocalProgress(status === "delivered" ? 1 : 0);
            setEta(status === "delivered" ? "Delivered" : "Cancelled");
            return;
        }

        const deliveryWindowMs = 15 * 60 * 1000; // 15 minutes

        const update = () => {
            const elapsed = Date.now() - new Date(createdAt).getTime();
            const p = Math.min(1, Math.max(0, elapsed / deliveryWindowMs));
            setLocalProgress(p);

            const remaining = Math.max(0, deliveryWindowMs - elapsed);
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            setEta(remaining <= 0 ? "Arriving now!" : `${mins}m ${secs}s`);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [createdAt, status]);

    // Draw the animated map
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;

        // Background - subtle gradient
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, "#f0fdf4");
        bgGrad.addColorStop(1, "#ecfdf5");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Draw grid lines (city blocks)
        ctx.strokeStyle = "#d1fae5";
        ctx.lineWidth = 0.5;
        for (let x = 0; x < w; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Draw "roads"
        ctx.strokeStyle = "#bbf7d0";
        ctx.lineWidth = 3;
        // Horizontal main road
        ctx.beginPath();
        ctx.moveTo(20, h * 0.5);
        ctx.lineTo(w - 20, h * 0.5);
        ctx.stroke();
        // Vertical main road
        ctx.beginPath();
        ctx.moveTo(w * 0.5, 20);
        ctx.lineTo(w * 0.5, h - 20);
        ctx.stroke();

        // Route path (store → delivery)
        const storeX = 40;
        const storeY = h * 0.7;
        const destX = w - 40;
        const destY = h * 0.3;
        const midX = w * 0.5;
        const midY = h * 0.5;

        // Draw route line
        ctx.strokeStyle = "#16a34a";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(storeX, storeY);
        ctx.quadraticCurveTo(midX, storeY, midX, midY);
        ctx.quadraticCurveTo(midX, destY, destX, destY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw traveled path (solid)
        if (progress > 0) {
            ctx.strokeStyle = "#16a34a";
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.8;
            const steps = Math.floor(progress * 100);
            ctx.beginPath();
            ctx.moveTo(storeX, storeY);
            for (let i = 0; i <= steps; i++) {
                const t = i / 100;
                let px: number, py: number;
                if (t < 0.5) {
                    const t2 = t * 2;
                    px = (1 - t2) * (1 - t2) * storeX + 2 * (1 - t2) * t2 * midX + t2 * t2 * midX;
                    py = (1 - t2) * (1 - t2) * storeY + 2 * (1 - t2) * t2 * storeY + t2 * t2 * midY;
                } else {
                    const t2 = (t - 0.5) * 2;
                    px = (1 - t2) * (1 - t2) * midX + 2 * (1 - t2) * t2 * midX + t2 * t2 * destX;
                    py = (1 - t2) * (1 - t2) * midY + 2 * (1 - t2) * t2 * destY + t2 * t2 * destY;
                }
                ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Store marker
        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        ctx.arc(storeX, storeY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🏪", storeX, storeY);

        // Store label
        ctx.fillStyle = "#16a34a";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("FreshMart", storeX + 16, storeY + 4);

        // Destination marker
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(destX, destY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("📍", destX, destY);

        // Destination label
        ctx.fillStyle = "#dc2626";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("Your Home", destX - 16, destY + 4);

        // Driver position (animated)
        if (progress > 0 && progress < 1 && status !== "cancelled") {
            let driverX: number, driverY: number;
            if (progress < 0.5) {
                const t = progress * 2;
                driverX = (1 - t) * (1 - t) * storeX + 2 * (1 - t) * t * midX + t * t * midX;
                driverY = (1 - t) * (1 - t) * storeY + 2 * (1 - t) * t * storeY + t * t * midY;
            } else {
                const t = (progress - 0.5) * 2;
                driverX = (1 - t) * (1 - t) * midX + 2 * (1 - t) * t * midX + t * t * destX;
                driverY = (1 - t) * (1 - t) * midY + 2 * (1 - t) * t * destY + t * t * destY;
            }

            // Driver pulse ring
            const pulse = (Math.sin(Date.now() / 300) + 1) / 2;
            ctx.fillStyle = `rgba(59, 130, 246, ${0.15 + pulse * 0.1})`;
            ctx.beginPath();
            ctx.arc(driverX, driverY, 16 + pulse * 4, 0, Math.PI * 2);
            ctx.fill();

            // Driver marker
            ctx.fillStyle = "#3b82f6";
            ctx.beginPath();
            ctx.arc(driverX, driverY, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🛵", driverX, driverY);
        }

        // Progress bar at bottom
        const barY = h - 8;
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(20, barY, w - 40, 4);
        ctx.fillStyle = status === "cancelled" ? "#dc2626" : "#16a34a";
        ctx.fillRect(20, barY, (w - 40) * progress, 4);

    }, [progress, status, createdAt]);

    // Redraw on animation frame for smooth driver animation
    useEffect(() => {
        if (status === "delivered" || status === "cancelled") return;

        let raf: number;
        const animate = () => {
            // Trigger re-render by updating canvas
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.dispatchEvent(new Event("redraw"));
            }
            raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [status]);

    const statusLabel = STATUS_LABELS[status] || status;

    return (
        <div className="mt-4 rounded-xl overflow-hidden border border-border/50 bg-card">
            {/* Map canvas */}
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    className="w-full"
                    style={{ height: "180px" }}
                />
                {/* Status overlay */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-border/50">
                    <div className="flex items-center gap-2">
                        {status === "out_for_delivery" ? (
                            <Truck className="w-4 h-4 text-blue-500 animate-pulse" />
                        ) : status === "delivered" ? (
                            <MapPin className="w-4 h-4 text-green-500" />
                        ) : (
                            <Navigation className="w-4 h-4 text-primary" />
                        )}
                        <span className="text-xs font-semibold text-foreground">{statusLabel}</span>
                    </div>
                </div>
            </div>

            {/* ETA bar */}
            <div className="px-4 py-3 bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                        {status === "delivered"
                            ? "Order delivered successfully!"
                            : status === "cancelled"
                                ? "Order was cancelled"
                                : "Estimated arrival"}
                    </span>
                </div>
                {status !== "delivered" && status !== "cancelled" && (
                    <span className="text-sm font-bold text-primary">{eta}</span>
                )}
            </div>
        </div>
    );
}
