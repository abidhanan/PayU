import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createToken, SESSION_COOKIE } from "@/lib/auth";
import { exchangeGoogleCode } from "@/lib/oauth";

export const dynamic = "force-dynamic";

const COLORS = ["#2f56f5", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("g_state="))
    ?.split("=")[1];

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, origin));

  if (!code || !state || !savedState || state !== savedState) {
    return fail("google_state");
  }

  const profile = await exchangeGoogleCode(code);
  if (!profile) return fail("google_failed");

  const email = profile.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: profile.name || email.split("@")[0],
        googleId: profile.sub,
        role: "SEEKER",
        avatarColor: COLORS[profile.sub.charCodeAt(0) % COLORS.length],
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.sub } });
  }

  if (user.bannedAt) return fail("banned");

  const token = await createToken({
    sub: user.id,
    email: user.email,
    role: user.role as "ADMIN" | "SPONSOR" | "SEEKER",
    name: user.name,
  });

  const res = NextResponse.redirect(new URL("/dashboard", origin));
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.delete("g_state");
  return res;
}
