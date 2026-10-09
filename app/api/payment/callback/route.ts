import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { markPaymentPaid } from "@/lib/payment-effects";

export const dynamic = "force-dynamic";

/**
 * Webhook endpoint for the QRIS gateway (pay.xoftware.id).
 * Expects a JSON body identifying the transaction by our `reference`
 * (or the gateway's external id) and a status. Adapt field names to the
 * live gateway's payload as needed.
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const reference: string | undefined = body.reference || body.order_id || body.merchant_ref;
  const externalId: string | undefined = body.id || body.transaction_id || body.trx_id;
  const status: string = String(body.status || body.transaction_status || "").toUpperCase();

  const isPaid = ["PAID", "SUCCESS", "SETTLED", "SETTLEMENT", "COMPLETED"].includes(status);

  const payment = reference
    ? await prisma.payment.findUnique({ where: { reference } })
    : externalId
    ? await prisma.payment.findFirst({ where: { externalId } })
    : null;

  if (!payment) return NextResponse.json({ error: "payment not found" }, { status: 404 });

  if (isPaid) {
    await markPaymentPaid(payment.id, externalId);
  } else if (["EXPIRED", "FAILED", "CANCELLED", "DENY"].includes(status)) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: status === "EXPIRED" ? "EXPIRED" : "FAILED" },
    });
  }

  return NextResponse.json({ ok: true });
}
