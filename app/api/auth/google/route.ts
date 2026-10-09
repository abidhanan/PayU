import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { googleAuthUrl, isGoogleConfigured } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_unconfigured", origin));
  }
  const state = randomUUID();
  const res = NextResponse.redirect(googleAuthUrl(state));
  res.cookies.set("g_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return res;
}
