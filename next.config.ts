import type { NextConfig } from "next";

const securityHeaders = [
    {
        key: "X-DNS-Prefetch-Control",
        value: "on",
    },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "X-XSS-Protection",
        value: "1; mode=block",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
    },
    {
        key: "Content-Security-Policy",
        value: [
            "default-src 'self'",
            // Note: 'unsafe-inline' needed for Next.js styled-jsx; remove if using CSS modules exclusively
            // 'unsafe-eval' removed to prevent XSS via eval(); may require code changes if dynamic code evaluation is used
            "script-src 'self' 'unsafe-inline' https://js.stripe.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://lh3.googleusercontent.com",
            "font-src 'self' data:",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
            "frame-src 'self' https://js.stripe.com",
            "frame-ancestors 'self'",
            "form-action 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "upgrade-insecure-requests",
        ].join("; "),
    },
];

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                // Apply security headers to all routes
                source: "/(.*)",
                headers: securityHeaders,
            },
        ];
    },
    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
};

export default nextConfig;
