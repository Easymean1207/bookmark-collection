import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("flow");
  const social = provider === "kakao" || provider === "google";
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  if (code || (tokenHash && request.nextUrl.searchParams.get("type") === "recovery")) {
    try {
      const supabase = createClient(await cookies());
      const { error } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: "recovery" });
      if (!error) return NextResponse.redirect(new URL(social ? "/" : "/reset-password", request.url));
    } catch {
      // Failed auth links return to the matching entry page below.
    }
  }
  return NextResponse.redirect(new URL(social ? `/login?error=${provider}` : "/reset-password?error=invalid-link", request.url));
}
