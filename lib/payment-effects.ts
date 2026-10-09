import { prisma } from "@/lib/db";

/**
 * Idempotently mark a payment as PAID and apply its side effects.
 * Called from both the "simulate payment" action and the gateway webhook.
 * Returns true if this call transitioned the payment to PAID.
 */
export async function markPaymentPaid(
  paymentId: string,
  externalId?: string | null
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return false;
    if (payment.status === "PAID") return false; // already applied

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        externalId: externalId ?? payment.externalId,
      },
    });

    if (payment.type === "BOUNTY_POST" && payment.bountyId) {
      await tx.bounty.update({
        where: { id: payment.bountyId },
        data: { status: "OPEN" },
      });
    }

    if (payment.type === "TOKEN_TOPUP" && payment.tokenAmount) {
      await tx.user.update({
        where: { id: payment.userId },
        data: { paidTokens: { increment: payment.tokenAmount } },
      });
    }

    return true;
  });
}

export async function expireIfNeeded(paymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return;
  if (payment.status === "PENDING" && payment.expiresAt.getTime() < Date.now()) {
    await prisma.payment.update({ where: { id: paymentId }, data: { status: "EXPIRED" } });
  }
}
