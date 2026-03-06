import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { PushPrompt } from "@/components/notifications/PushPrompt";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const viewport: Viewport = {
  themeColor: "#16a34a",
};

export const metadata: Metadata = {
  title: "FreshMart | Fresh Groceries, Delivered",
  description:
    "Premium groceries delivered to your door. Farm-fresh produce, daily essentials, and more.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress benign Supabase navigator.locks AbortError
              // caused by concurrent auth token refresh during HMR / navigation
              addEventListener("unhandledrejection", function(e) {
                if (e.reason && e.reason.name === "AbortError" &&
                    e.reason.message && e.reason.message.includes("steal")) {
                  e.preventDefault();
                }
              });
            `,
          }}
        />
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
        <PushPrompt />
      </body>
    </html>
  );
}
