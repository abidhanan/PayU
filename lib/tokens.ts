import type { User } from "@prisma/client";
import { prisma } from "./db";
import { getSettings } from "./settings";

/** Current month key, e.g. "2026-08". Server local time is fine for a monthly reset. */
export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Reset the free monthly token allotment if we've crossed into a new month.
 * Paid (topped-up) tokens are preserved across resets.
 */
export async function syncTokens(user: User): Promise<User> {
  if (user.role !== "SEEKER") return user;
  const key = currentMonthKey();
  if (user.tokenResetKey === key) return user;
  const settings = await getSettings();
  return prisma.user.update({
    where: { id: user.id },
    data: { freeTokens: settings.freeTokens, tokenResetKey: key },
  });
}

export function availableTokens(user: Pick<User, "freeTokens" | "paidTokens">): number {
  return user.freeTokens + user.paidTokens;
}

/** Deduct one token: free tokens first, then paid. Returns updated counts. */
export async function consumeToken(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  if (user.freeTokens > 0) {
    await prisma.user.update({ where: { id: userId }, data: { freeTokens: { decrement: 1 } } });
  } else if (user.paidTokens > 0) {
    await prisma.user.update({ where: { id: userId }, data: { paidTokens: { decrement: 1 } } });
  }
}
