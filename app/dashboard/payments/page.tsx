import Link from "next/link";
import { Receipt, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatRupiah, timeAgo } from "@/lib/utils";
import { StatusBadge, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pembayaran" };

const TYPE_LABEL: Record<string, string> = {
  BOUNTY_POST: "Pasang Bounty",
  TOKEN_TOPUP: "Top Up Token",
};

export default async function PaymentsPage() {
  const user = await requireUser();
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { bounty: { select: { title: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Riwayat Pembayaran</h1>
        <p className="mt-2 muted">Semua transaksi di PayU.</p>
      </div>

      {payments.length === 0 ? (
        <EmptyState icon={<Receipt className="h-6 w-6" />} title="Belum ada transaksi" description="Transaksi kamu akan muncul di sini." />
      ) : (
        <div className="card divide-y overflow-hidden p-0" style={{ borderColor: "var(--border)" }}>
          {payments.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/payments/${p.id}`}
              className="flex items-center justify-between gap-4 p-4 transition hover:surface-2 sm:p-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{TYPE_LABEL[p.type] ?? p.type}</p>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm muted [overflow-wrap:anywhere]">
                  {p.bounty?.title ? `${p.bounty.title} · ` : ""}
                  {p.tokenAmount ? `${p.tokenAmount} token · ` : ""}
                  {p.reference} · {timeAgo(p.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold">{formatRupiah(p.amount)}</p>
                <ChevronRight className="h-4 w-4 shrink-0 muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
