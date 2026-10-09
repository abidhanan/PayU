import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { PaymentClient } from "@/components/payment-client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isSimulationMode } from "@/lib/payment";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pembayaran QRIS" };

export default async function PayPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { bounty: { select: { slug: true, title: true } } },
  });
  if (!payment || payment.userId !== user.id) notFound();

  const description =
    payment.type === "BOUNTY_POST"
      ? `Bounty: ${payment.bounty?.title ?? ""}`
      : `Top up ${payment.tokenAmount ?? 0} token`;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <Link href="/"><Logo /></Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <PaymentClient
            id={payment.id}
            amount={payment.amount}
            reference={payment.reference}
            qrisImage={payment.qrisImage}
            type={payment.type as "BOUNTY_POST" | "TOKEN_TOPUP"}
            status={payment.status as "PENDING" | "PAID" | "EXPIRED" | "FAILED"}
            expiresAt={payment.expiresAt.toISOString()}
            bountySlug={payment.bounty?.slug ?? null}
            simulated={isSimulationMode()}
            description={description}
          />
        </div>
      </main>
    </div>
  );
}
