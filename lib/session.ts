import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyToken, type SessionPayload } from "./auth";
import { prisma } from "./db";
import { syncTokens } from "./tokens";

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
});

/** Full user record from the database for the current session. */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user || user.bannedAt) return null;
  // keep the monthly token allotment fresh
  return syncTokens(user);
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: "ADMIN" | "SPONSOR" | "SEEKER") {
  const user = await requireUser();
  if (user.role !== role) redirect("/dashboard");
  return user;
}
