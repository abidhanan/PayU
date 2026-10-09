import { prisma } from "@/lib/db";
import { formatRupiah, formatDate } from "@/lib/utils";
import { StatusBadge, Avatar, EmptyState } from "@/components/ui";
import { Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = { BOUNTY_POST: "Pasang Bounty", TOKEN_TOPUP: "Top Up Token" };

export default async function AdminPayments() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, avatarColor: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Pembayaran</h1>
        <p className="text-sm muted">100 transaksi QRIS terbaru di platform.</p>
      </div>

      {payments.length === 0 ? (
        <EmptyState icon={<Receipt className="h-6 w-6" />} title="Belum ada transaksi" />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left muted" style={{ borderColor: "var(--border)" }}>
                  <th className="p-4 font-semibold">Pengguna</th>
                  <th className="p-4 font-semibold">Jenis</th>
                  <th className="p-4 font-semibold">Referensi</th>
                  <th className="p-4 font-semibold">Tanggal</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 text-right font-semibold">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={p.user.name} color={p.user.avatarColor} size={30} />
                        <span className="font-medium">{p.user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 muted">{TYPE_LABEL[p.type] ?? p.type}</td>
                    <td className="p-4 font-mono text-xs muted">{p.reference}</td>
                    <td className="p-4 muted">{formatDate(p.createdAt)}</td>
                    <td className="p-4"><StatusBadge status={p.status} /></td>
                    <td className="p-4 text-right font-bold">{formatRupiah(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
