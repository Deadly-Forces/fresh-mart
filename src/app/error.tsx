"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorPage({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error: _error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mx-auto mb-5">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">Something went wrong</h1>
                <p className="text-muted-foreground text-sm mb-8">
                    An unexpected error occurred. Please try refreshing the page.
                </p>
                <Button onClick={reset} className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Try Again
                </Button>
            </div>
        </div>
    );
}
