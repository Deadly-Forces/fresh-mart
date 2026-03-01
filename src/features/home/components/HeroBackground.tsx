"use client";

/**
 * Aesthetic animated background for the hero section.
 * Renders floating grocery-themed SVG shapes (leaves, citrus slices, rings)
 * and gradient orbs that drift slowly behind the hero content.
 */

/* ── Static particles (no randomness needed for SSR safety) ── */
const PARTICLES = [
    { id: 1, x: 5, y: 10, size: 32, dur: 22, delay: 0, type: "leaf" as const, drift: 20, rot: 30 },
    { id: 2, x: 85, y: 15, size: 28, dur: 26, delay: -4, type: "citrus" as const, drift: -25, rot: 60 },
    { id: 3, x: 15, y: 65, size: 24, dur: 20, delay: -8, type: "ring" as const, drift: 30, rot: 0 },
    { id: 4, x: 70, y: 70, size: 36, dur: 28, delay: -2, type: "leaf" as const, drift: -15, rot: 120 },
    { id: 5, x: 45, y: 20, size: 20, dur: 18, delay: -6, type: "dot" as const, drift: 10, rot: 0 },
    { id: 6, x: 30, y: 80, size: 30, dur: 24, delay: -10, type: "citrus" as const, drift: 35, rot: 180 },
    { id: 7, x: 90, y: 50, size: 26, dur: 22, delay: -3, type: "ring" as const, drift: -20, rot: 45 },
    { id: 8, x: 60, y: 5, size: 22, dur: 30, delay: -7, type: "leaf" as const, drift: 15, rot: 90 },
    { id: 9, x: 10, y: 40, size: 18, dur: 19, delay: -12, type: "dot" as const, drift: -10, rot: 0 },
    { id: 10, x: 50, y: 55, size: 34, dur: 25, delay: -1, type: "leaf" as const, drift: -30, rot: 200 },
    { id: 11, x: 75, y: 30, size: 28, dur: 21, delay: -5, type: "circle" as const, drift: 25, rot: 0 },
    { id: 12, x: 20, y: 25, size: 22, dur: 27, delay: -9, type: "circle" as const, drift: -20, rot: 0 },
    { id: 13, x: 40, y: 85, size: 26, dur: 23, delay: -11, type: "ring" as const, drift: 18, rot: 135 },
    { id: 14, x: 65, y: 42, size: 16, dur: 17, delay: -6, type: "dot" as const, drift: -8, rot: 0 },
    { id: 15, x: 55, y: 75, size: 30, dur: 26, delay: -3, type: "citrus" as const, drift: 22, rot: 270 },
    { id: 16, x: 25, y: 50, size: 38, dur: 30, delay: -2, type: "leaf" as const, drift: -18, rot: 150 },
    { id: 17, x: 80, y: 85, size: 20, dur: 20, delay: -8, type: "dot" as const, drift: 12, rot: 0 },
    { id: 18, x: 35, y: 35, size: 24, dur: 22, delay: -4, type: "circle" as const, drift: -28, rot: 0 },
];

function LeafSvg({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
            <path
                d="M20 4C20 4 6 14 6 26C6 32 12 38 20 36C28 38 34 32 34 26C34 14 20 4 20 4Z"
                fill="currentColor"
            />
            <path
                d="M20 8V32M14 18C14 18 17 22 20 22M26 16C26 16 23 20 20 20"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.8"
                fill="none"
            />
        </svg>
    );
}

function CitrusSvg({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="16" fill="currentColor" />
            <circle cx="20" cy="20" r="12" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" fill="none" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
                <line
                    key={a}
                    x1="20" y1="20"
                    x2={20 + 11 * Math.cos((a * Math.PI) / 180)}
                    y2={20 + 11 * Math.sin((a * Math.PI) / 180)}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.4"
                />
            ))}
        </svg>
    );
}

function RingSvg({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.5" />
        </svg>
    );
}

function Particle({ p }: { p: typeof PARTICLES[number] }) {
    const base: React.CSSProperties = {
        position: "absolute",
        left: `${p.x}%`,
        top: `${p.y}%`,
        animationDuration: `${p.dur}s`,
        animationDelay: `${p.delay}s`,
        ["--drift" as string]: `${p.drift}px`,
        ["--rotation" as string]: `${p.rot}deg`,
    };

    if (p.type === "leaf") {
        return (
            <div className="animate-hero-float text-emerald-400/40 dark:text-emerald-400/25" style={base}>
                <LeafSvg size={p.size} />
            </div>
        );
    }
    if (p.type === "citrus") {
        return (
            <div className="animate-hero-drift text-amber-400/35 dark:text-amber-400/25" style={base}>
                <CitrusSvg size={p.size} />
            </div>
        );
    }
    if (p.type === "ring") {
        return (
            <div className="animate-hero-float text-emerald-300/30 dark:text-emerald-400/20" style={base}>
                <RingSvg size={p.size} />
            </div>
        );
    }
    if (p.type === "circle") {
        return (
            <div
                className="animate-hero-drift rounded-full bg-primary/20 dark:bg-primary/15"
                style={{ ...base, width: p.size, height: p.size }}
            />
        );
    }
    /* dot */
    return (
        <div
            className="animate-hero-twinkle rounded-full bg-emerald-300/50 dark:bg-emerald-400/30"
            style={{ ...base, width: p.size * 0.5, height: p.size * 0.5 }}
        />
    );
}

export function HeroBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]" aria-hidden="true">
            {/* ── Slow gradient orbs ── */}
            <div className="absolute w-[600px] h-[600px] top-[-10%] left-[15%] rounded-full bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-transparent blur-3xl animate-hero-orb-1" />
            <div className="absolute w-[500px] h-[500px] bottom-[-5%] right-[10%] rounded-full bg-gradient-to-tl from-teal-400/15 via-teal-300/8 to-transparent blur-3xl animate-hero-orb-2" />
            <div className="absolute w-[400px] h-[400px] top-[40%] right-[-3%] rounded-full bg-gradient-to-bl from-amber-400/12 to-transparent blur-3xl animate-hero-orb-3" />

            {/* ── Floating particles ── */}
            {PARTICLES.map((p) => (
                <Particle key={p.id} p={p} />
            ))}

            {/* ── Subtle grid texture ── */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `
                        linear-gradient(hsl(var(--primary) / 0.4) 1px, transparent 1px),
                        linear-gradient(90deg, hsl(var(--primary) / 0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                }}
            />
        </div>
    );
}
