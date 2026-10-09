import Link from "next/link";
import { Users, Briefcase, Wallet, Coins, TrendingUp, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatRupiah, timeAgo } from "@/lib/utils";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [
    userCount, seekerCount, sponsorCount,
    bountyCount, openCount,
    feeAgg, tokenAgg, paidCount,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SEEKER" } }),
    prisma.user.count({ where: { role: "SPONSOR" } }),
    prisma.bounty.count({ where: { status: { not: "PENDING_PAYMENT" } } }),
    prisma.bounty.count({ where: { status: "OPEN" } }),
    prisma.bounty.aggregate({ _sum: { adminFee: true }, where: { status: { in: ["OPEN", "IN_REVIEW", "COMPLETED"] } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID", type: "TOKEN_TOPUP" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    prisma.payment.findMany({
      where: { status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 6,
      include: { user: { select: { name: true } } },
    }),
  ]);

  const platformRevenue = (feeAgg._sum.adminFee ?? 0) + (tokenAgg._sum.amount ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Ringkasan Platform</h1>
        <p className="text-sm muted">Pantau performa PayU secara keseluruhan.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<TrendingUp className="h-6 w-6" />} label="Pendapatan platform" value={formatRupiah(platformRevenue)} sub="Biaya admin + penjualan token" accent="#10b981" />
        <StatCard icon={<Wallet className="h-6 w-6" />} label="Total transaksi lunas" value={formatRupiah(paidCount._sum.amount ?? 0)} accent="#2f56f5" />
        <StatCard icon={<Coins className="h-6 w-6" />} label="Penjualan token" value={formatRupiah(tokenAgg._sum.amount ?? 0)} accent="#f59e0b" />
        <StatCard icon={<Users className="h-6 w-6" />} label="Total pengguna" value={userCount} sub={`${seekerCount} pencari · ${sponsorCount} pemberi`} accent="#6366f1" />
        <StatCard icon={<Briefcase className="h-6 w-6" />} label="Total bounty" value={bountyCount} accent="#ec4899" />
        <StatCard icon={<Clock className="h-6 w-6" />} label="Bounty aktif" value={openCount} accent="#0ea5e9" />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-bold">Transaksi Terbaru</h2>
        {recentPayments.length === 0 ? (
          <p className="text-sm muted">Belum ada transaksi.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentPayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold [overflow-wrap:anywhere]">{p.user.name}</p>
                  <p className="text-sm muted">{p.type === "BOUNTY_POST" ? "Pasang Bounty" : "Top Up Token"} · {p.paidAt ? timeAgo(p.paidAt) : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatRupiah(p.amount)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
