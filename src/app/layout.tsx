import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
