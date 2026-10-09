"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { createQrisPayment, isSimulationMode } from "@/lib/payment";
import { markPaymentPaid } from "@/lib/payment-effects";

function makeRef(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(performance.now() * 1000)
    .toString(36)
    .slice(-4)}`.toUpperCase();
}

/** Seeker buys extra tokens. Creates a pending QRIS payment and opens the pay page. */
export async function createTopupPayment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEEKER") redirect("/login");

  const qty = Math.max(1, Math.min(50, Number(formData.get("qty") || 1)));
  const settings = await getSettings();
  const amount = qty * settings.tokenPrice;
  const reference = makeRef("TOP");

  const qris = await createQrisPayment({
    amount,
    reference,
    description: `Top up ${qty} token PayU`,
  });

  const payment = await prisma.payment.create({
    data: {
      reference,
      type: "TOKEN_TOPUP",
      amount,
      tokenAmount: qty,
      userId: user.id,
      qrisString: qris.qrisString,
      qrisImage: qris.qrisImage,
      externalId: qris.externalId,
      expiresAt: qris.expiresAt,
    },
  });

  redirect(`/pay/${payment.id}`);
}

/** Simulation-only helper so the flow is testable without a live gateway. */
export async function simulatePaymentAction(paymentId: string) {
  if (!isSimulationMode()) return { error: "Simulasi hanya tersedia di mode demo." };
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.userId !== user.id) return { error: "Pembayaran tidak ditemukan." };
  await markPaymentPaid(paymentId);
  revalidatePath(`/pay/${paymentId}`);
  return { ok: true };
}
