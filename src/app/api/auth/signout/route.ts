import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");

  // Validate origin to prevent open redirect attacks
  const { origin } = new URL(request.url);
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  // Use a safe default origin if the current one isn't allowed
  const safeOrigin = allowedOrigins.includes(origin)
    ? origin
    : process.env.NEXT_PUBLIC_APP_URL || origin;

  // Redirect to home page
  return NextResponse.redirect(new URL("/", safeOrigin), {
    status: 302,
  });
}
