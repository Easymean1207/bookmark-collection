import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  if (code || (tokenHash && request.nextUrl.searchParams.get("type") === "recovery")) {
    try {
      const supabase = createClient(await cookies());
      const { error } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: "recovery" });
      if (!error) return NextResponse.redirect(new URL("/reset-password", request.url));
    } catch {
      // Expired or invalid recovery links return to the reset page with an error.
    }
  }
  return NextResponse.redirect(new URL("/reset-password?error=invalid-link", request.url));
}
