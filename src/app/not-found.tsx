"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <p className="text-7xl font-semibold text-muted-foreground/20 mb-4">404</p>
                <h1 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h1>
                <p className="text-muted-foreground text-sm mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link href="/">
                        <Button className="gap-2">
                            <Home className="w-4 h-4" /> Go Home
                        </Button>
                    </Link>
                    <Button variant="outline" className="gap-2" onClick={() => history.back()}>
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
