import Link from "next/link";
import {
  Coins,
  Wallet,
  FileText,
  Trophy,
  Briefcase,
  Users,
  TrendingUp,
  Shield,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { availableTokens } from "@/lib/tokens";
import { getSettings } from "@/lib/settings";
import { formatRupiah } from "@/lib/utils";
import { StatCard } from "@/components/stat-card";
import { StatusBadge, LinkButton, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === "SEEKER") return <SeekerDashboard userId={user.id} name={user.name} tokens={availableTokens(user)} />;
  if (user.role === "SPONSOR") return <SponsorDashboard userId={user.id} name={user.name} />;
  return <AdminOverview name={user.name} />;
}

async function SeekerDashboard({
  userId, name, tokens,
}: { userId: string; name: string; tokens: number }) {
  const subs = await prisma.submission.findMany({
    where: { seekerId: userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { bounty: { select: { title: true, slug: true, bountyAmount: true } } },
  });

  return (
    <div className="space-y-6">
      <Header title={`Halo, ${name.split(" ")[0]} 👋`} />

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Token Bulanan</h2>
            <p className="text-sm muted">3 token gratis setiap bulan. Hanya berkurang saat menang.</p>
          </div>
          <LinkButton href="/dashboard/tokens" size="sm"><Coins className="h-4 w-4" /> Top Up</LinkButton>
        </div>
        <div className="mt-4 flex gap-2">
          {Array.from({ length: Math.max(tokens, 3) }).map((_, i) => (
            <span key={i} className={`h-2.5 flex-1 rounded-full ${i < tokens ? "bg-amber-400" : "surface-2"}`} />
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Submission Terbaru</h2>
          <Link href="/dashboard/submissions" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">Lihat semua</Link>
        </div>
        {subs.length === 0 ? (
          <EmptyState icon={<FileText className="h-6 w-6" />} title="Belum ada submission" description="Jelajahi bounty dan kirim karya pertamamu." action={<LinkButton href="/bounties">Jelajahi Bounty</LinkButton>} />
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {subs.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <Link href={`/bounties/${s.bounty.slug}`} className="min-w-0 flex-1">
                  <p className="font-semibold [overflow-wrap:anywhere] hover:text-brand-500">{s.bounty.title}</p>
                  <p className="text-sm muted">{formatRupiah(s.bounty.bountyAmount)}</p>
                </Link>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

async function SponsorDashboard({ userId, name }: { userId: string; name: string }) {
  const [bounties, agg, subCount] = await Promise.all([
    prisma.bounty.findMany({
      where: { sponsorId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true, _count: { select: { submissions: true } } },
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { userId, status: "PAID", type: "BOUNTY_POST" } }),
    prisma.submission.count({ where: { bounty: { sponsorId: userId } } }),
  ]);
  const active = await prisma.bounty.count({ where: { sponsorId: userId, status: "OPEN" } });
  const totalBounties = await prisma.bounty.count({ where: { sponsorId: userId, status: { not: "PENDING_PAYMENT" } } });

  return (
    <div className="space-y-6">
      <Header title={`Halo, ${name.split(" ")[0]} 👋`} subtitle="Kelola bounty dan temukan talenta terbaik." action={<LinkButton href="/dashboard/post"><PlusCircle className="h-4 w-4" /> Pasang Bounty</LinkButton>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Briefcase className="h-6 w-6" />} label="Total bounty" value={totalBounties} accent="#2f56f5" />
        <StatCard icon={<TrendingUp className="h-6 w-6" />} label="Bounty aktif" value={active} accent="#10b981" />
        <StatCard icon={<Users className="h-6 w-6" />} label="Total submission" value={subCount} accent="#6366f1" />
        <StatCard icon={<Wallet className="h-6 w-6" />} label="Total dibelanjakan" value={formatRupiah(agg._sum.amount ?? 0)} accent="#f59e0b" />
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Bounty Terbaru</h2>
          <Link href="/dashboard/bounties" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">Lihat semua</Link>
        </div>
        {bounties.length === 0 ? (
          <EmptyState icon={<Briefcase className="h-6 w-6" />} title="Belum ada bounty" description="Pasang bounty pertamamu dan mulai cari talenta." action={<LinkButton href="/dashboard/post">Pasang Bounty</LinkButton>} />
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {bounties.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                <Link href={b.status === "PENDING_PAYMENT" ? "/dashboard/bounties" : `/bounties/${b.slug}`} className="min-w-0 flex-1">
                  <p className="font-semibold [overflow-wrap:anywhere] hover:text-brand-500">{b.title}</p>
                  <p className="text-sm muted">{formatRupiah(b.bountyAmount)} · {b._count.submissions} submission</p>
                </Link>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

async function AdminOverview({ name }: { name: string }) {
  const [users, bounties, revenue, tokenRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.bounty.count({ where: { status: { not: "PENDING_PAYMENT" } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID", type: "TOKEN_TOPUP" } }),
  ]);

  return (
    <div className="space-y-6">
      <Header title={`Halo, ${name.split(" ")[0]} 👋`} subtitle="Ringkasan platform PayU." action={<LinkButton href="/admin"><Shield className="h-4 w-4" /> Panel Admin</LinkButton>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-6 w-6" />} label="Total pengguna" value={users} accent="#2f56f5" />
        <StatCard icon={<Briefcase className="h-6 w-6" />} label="Total bounty" value={bounties} accent="#10b981" />
        <StatCard icon={<Wallet className="h-6 w-6" />} label="Total transaksi" value={formatRupiah(revenue._sum.amount ?? 0)} accent="#f59e0b" />
        <StatCard icon={<Coins className="h-6 w-6" />} label="Penjualan token" value={formatRupiah(tokenRevenue._sum.amount ?? 0)} accent="#6366f1" />
      </div>
      <Link href="/admin" className="card flex items-center justify-between p-6 transition hover:shadow-glow">
        <div>
          <h2 className="text-lg font-bold">Buka Panel Admin</h2>
          <p className="text-sm muted">Kelola kategori, pengguna, bounty, pembayaran, dan pengaturan.</p>
        </div>
        <ArrowRight className="h-5 w-5 text-brand-500" />
      </Link>
    </div>
  );
}

function Header({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="text-sm muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
