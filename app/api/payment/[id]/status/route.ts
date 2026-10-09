import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { expireIfNeeded } from "@/lib/payment-effects";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await expireIfNeeded(params.id);

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { bounty: { select: { slug: true } } },
  });
  if (!payment || payment.userId !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: payment.status,
    type: payment.type,
    bountySlug: payment.bounty?.slug ?? null,
  });
}
