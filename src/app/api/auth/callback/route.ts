import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Custom fetch wrapper that handles ECONNRESET / TLS failures
 * by using AbortController for timeouts and fresh connections.
 */
function createResilientFetch(timeoutMs = 15000) {
  return async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
        keepalive: false,
      });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  };
}

async function exchangeCodeWithRetry(code: string, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const cookieStore = await cookies();

      // Create a fresh client with custom resilient fetch for each attempt
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options),
                );
              } catch {
                // Ignored in Server Component context
              }
            },
          },
          global: {
            fetch: createResilientFetch(),
          },
        },
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        // Check if this is a retryable network error vs a real auth error
        const isRetryable =
          error.status === 0 ||
          error.name?.includes("Retryable") ||
          error.message?.includes("fetch failed") ||
          error.message?.includes("ECONNRESET");

        if (!isRetryable) {
          // Genuine auth error (invalid code, expired, etc.) — don't retry
          console.error(
            `Auth exchange error on attempt ${attempt} (non-retryable):`,
            error.message,
          );
          return { error };
        }

        // Network / TLS error — retry
        console.warn(
          `Auth exchange attempt ${attempt}/${maxRetries} failed (retryable):`,
          error.message,
        );
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        return { error };
      }

      console.log(`Auth code exchange succeeded on attempt ${attempt}`);
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `Auth callback attempt ${attempt}/${maxRetries} failed:`,
        message,
      );

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, 8s
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        return { error: err };
      }
    }
  }
  return { error: new Error("All retry attempts failed") };
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Validate origin to prevent open redirect attacks
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  // Use a safe default origin if the current one isn't allowed
  const safeOrigin = allowedOrigins.includes(origin)
    ? origin
    : process.env.NEXT_PUBLIC_APP_URL || origin;

  if (code) {
    const { error } = await exchangeCodeWithRetry(code);

    if (!error) {
      return NextResponse.redirect(`${safeOrigin}/`);
    }

    console.error("Auth callback failed after all retries:", error);
  }

  return NextResponse.redirect(`${safeOrigin}/login?error=AuthError`);
}
