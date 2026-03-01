"use client";

import { useSearchParams } from "next/navigation";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";

export function LoginContent() {
    const searchParams = useSearchParams();
    const errorParam = searchParams.get("error");

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-[480px] p-8 sm:p-12 rounded-card shadow-modal">
                <GoogleSignInButton errorParam={errorParam} />

                <p className="font-body text-xs text-muted-foreground mt-8 text-center">
                    By continuing, you agree to our{" "}
                    <a href="/terms" className="text-primary hover:underline">
                        Terms
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                    </a>
                </p>
            </div>
        </div>
    );
}
