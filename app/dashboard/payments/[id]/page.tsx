import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, QrCode } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { formatRupiah, formatDate } from "@/lib/utils";
import { StatusBadge, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detail Pembayaran" };

const TYPE_LABEL: Record<string, string> = {
  BOUNTY_POST: "Pasang Bounty",
  TOKEN_TOPUP: "Top Up Token",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="muted">{label}</dt>
      <dd className="text-right font-medium [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

export default async function PaymentDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { bounty: { select: { title: true, slug: true } } },
  });
  if (!payment || payment.userId !== user.id) notFound();

  return (
    <div className="space-y-6">
      <Link href="/dashboard/payments" className="inline-flex items-center gap-1.5 text-sm font-medium muted hover:text-brand-500">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Detail Pembayaran</h1>
        <p className="mt-2 muted">Rincian transaksi kamu di PayU.</p>
      </div>

      <div className="card max-w-xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm muted">{TYPE_LABEL[payment.type] ?? payment.type}</p>
            <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-300">{formatRupiah(payment.amount)}</p>
          </div>
          <StatusBadge status={payment.status} />
        </div>

        <dl className="mt-6 space-y-3 border-t pt-6 text-sm" style={{ borderColor: "var(--border)" }}>
          <Row label="Referensi" value={<span className="font-mono">{payment.reference}</span>} />
          {payment.bounty && (
            <Row
              label="Bounty"
              value={<Link href={`/bounties/${payment.bounty.slug}`} className="text-brand-600 hover:underline dark:text-brand-300">{payment.bounty.title}</Link>}
            />
          )}
          {payment.tokenAmount ? <Row label="Jumlah token" value={`${payment.tokenAmount} token`} /> : null}
          <Row label="Dibuat" value={formatDate(payment.createdAt)} />
          {payment.paidAt && <Row label="Dibayar" value={formatDate(payment.paidAt)} />}
          <Row label="Berlaku hingga" value={formatDate(payment.expiresAt)} />
        </dl>

        {payment.status === "PENDING" && (
          <LinkButton href={`/pay/${payment.id}`} className="mt-6 w-full">
            <QrCode className="h-4 w-4" /> Lanjutkan Pembayaran
          </LinkButton>
        )}
      </div>
    </div>
  );
}
