import { Suspense } from "react";
import { LoginContent } from "./LoginContent";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-[480px] p-8 sm:p-12 rounded-card shadow-modal animate-pulse">
            <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4" />
            <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-8" />
            <div className="h-12 bg-muted rounded w-full" />
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
