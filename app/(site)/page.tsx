import Link from "next/link";
import { ArrowRight, Coins, Trophy, Rocket, Zap, Sparkles, Wallet, FileText, Briefcase, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { LinkButton } from "@/components/ui";
import { BountyCard } from "@/components/bounty-card";
import { CategoryIcon } from "@/components/category-icon";

export const dynamic = "force-dynamic";

async function getData() {
  const [categories, featured, openCount, paidAgg, seekerCount] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { bounties: true } } },
    }),
    prisma.bounty.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        category: true,
        sponsor: { select: { name: true, avatarColor: true } },
        _count: { select: { submissions: true } },
      },
    }),
    prisma.bounty.count({ where: { status: "OPEN" } }),
    prisma.bounty.aggregate({ _sum: { bountyAmount: true }, where: { status: { in: ["OPEN", "COMPLETED"] } } }),
    prisma.user.count({ where: { role: "SEEKER" } }),
  ]);
  return {
    categories,
    featured,
    stats: {
      open: openCount,
      totalBounty: paidAgg._sum.bountyAmount ?? 0,
      seekers: seekerCount,
    },
  };
}

async function getHero(user: { id: string; name: string; role: string; earnings: number }) {
  if (user.role === "SEEKER") {
    const [wins, subCount] = await Promise.all([
      prisma.submission.count({ where: { seekerId: user.id, status: "WINNER" } }),
      prisma.submission.count({ where: { seekerId: user.id } }),
    ]);
    return {
      subtitle: "",
      stats: [
        { icon: Wallet, label: "Total penghasilan", value: formatRupiah(user.earnings) },
        { icon: Trophy, label: "Bounty dimenangkan", value: formatNumber(wins) },
        { icon: FileText, label: "Total submission", value: formatNumber(subCount) },
      ],
    };
  }
  if (user.role === "SPONSOR") {
    const [totalB, activeB, subRecv] = await Promise.all([
      prisma.bounty.count({ where: { sponsorId: user.id, status: { not: "PENDING_PAYMENT" } } }),
      prisma.bounty.count({ where: { sponsorId: user.id, status: "OPEN" } }),
      prisma.submission.count({ where: { bounty: { sponsorId: user.id } } }),
    ]);
    return {
      subtitle: "Kelola bounty dan temukan talenta terbaik.",
      stats: [
        { icon: Briefcase, label: "Total bounty", value: formatNumber(totalB) },
        { icon: Rocket, label: "Bounty aktif", value: formatNumber(activeB) },
        { icon: Users, label: "Submission diterima", value: formatNumber(subRecv) },
      ],
    };
  }
  const [users, bounties, active] = await Promise.all([
    prisma.user.count(),
    prisma.bounty.count({ where: { status: { not: "PENDING_PAYMENT" } } }),
    prisma.bounty.count({ where: { status: "OPEN" } }),
  ]);
  return {
    subtitle: "Ringkasan singkat platform PayU.",
    stats: [
      { icon: Users, label: "Total pengguna", value: formatNumber(users) },
      { icon: Briefcase, label: "Total bounty", value: formatNumber(bounties) },
      { icon: Rocket, label: "Bounty aktif", value: formatNumber(active) },
    ],
  };
}

export default async function HomePage() {
  const { categories, featured, stats } = await getData();
  const user = await getCurrentUser();
  const hero = user ? await getHero(user) : null;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% -10%, rgba(47,86,245,0.22), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-screen-2xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24">
          {user && hero ? (
            <>
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
                  Halo, {user.name.split(" ")[0]} 👋
                </h1>
                {hero.subtitle && (
                  <p className="mx-auto mt-4 max-w-xl text-base muted sm:text-lg">{hero.subtitle}</p>
                )}
              </div>
              <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
                {hero.stats.map((s) => (
                  <div key={s.label} className="card flex flex-col items-center gap-1 px-3 py-6 text-center">
                    <s.icon className="mb-1 h-5 w-5 text-brand-500" />
                    <p className="text-xl font-extrabold [overflow-wrap:anywhere] sm:text-2xl">{s.value}</p>
                    <p className="text-xs muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-300" style={{ borderColor: "var(--border)" }}>
                  <Sparkles className="h-3.5 w-3.5" /> Platform bounty freelance #1 untuk kreator Indonesia
                </span>
                <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
                  Kerjakan tugas.{" "}
                  <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                    Menangkan bounty.
                  </span>
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-base muted sm:text-lg">
                  Pemberi kerja memasang tugas berhadiah. Pencari kerja memilih tantangan yang cocok,
                  mengirim karya terbaik, dan yang menang mendapatkan hadiahnya. Pembayaran instan lewat QRIS.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <LinkButton href="/bounties" size="lg" className="w-full sm:w-auto">
                    Jelajahi Bounty <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                </div>
              </div>

              {/* Stats */}
              <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-4">
                {[
                  { icon: Rocket, label: "Bounty aktif", value: formatNumber(stats.open) },
                  { icon: Coins, label: "Total hadiah", value: formatRupiah(stats.totalBounty) },
                  { icon: Trophy, label: "Pencari kerja", value: formatNumber(stats.seekers) },
                ].map((s) => (
                  <div key={s.label} className="card flex flex-col items-center gap-1 px-3 py-5 text-center">
                    <s.icon className="mb-1 h-5 w-5 text-brand-500" />
                    <p className="text-lg font-extrabold sm:text-2xl">{s.value}</p>
                    <p className="text-xs muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6">
        <div className="mb-7">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Kategori</h2>
          <p className="mt-1 text-sm muted">Temukan kategori bounty sesuai keahlianmu.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/bounties?category=${c.slug}`}
              className="card flex flex-col items-center gap-2 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${c.color}18`, color: c.color }}
              >
                <CategoryIcon name={c.icon} className="h-6 w-6" />
              </span>
              <span className="text-sm font-bold">{c.name}</span>
              <span className="text-xs muted">{c._count.bounties} bounty</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured bounties */}
      <section className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Bounty Terbaru</h2>
            <p className="mt-1 text-sm muted">Banyak peluang menantimu.</p>
          </div>
          <LinkButton href="/bounties" variant="secondary" size="sm">Lihat semua →</LinkButton>
        </div>
        {featured.length === 0 ? (
          <div className="card p-10 text-center muted">Belum ada bounty terbuka. Cek lagi nanti!</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((b) => (
              <BountyCard key={b.id} bounty={b} />
            ))}
          </div>
        )}
      </section>

      {/* CTA — hanya tampil untuk pengunjung yang belum login */}
      {!user && (
      <section className="mx-auto max-w-screen-2xl px-4 pb-8 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 p-8 text-center text-white sm:p-14">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/10" />
          <Zap className="mx-auto mb-3 h-8 w-8" />
          <h2 className="text-2xl font-extrabold sm:text-4xl">Siap mulai berpenghasilan?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/85">
            Gabung gratis. Dapatkan 3 token setiap bulan dan mulai memenangkan bounty hari ini.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 font-bold text-brand-700 transition hover:bg-white/90">
              Daftar Gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/bounties" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 px-6 font-bold text-white transition hover:bg-white/10">
              Lihat Bounty
            </Link>
          </div>
        </div>
      </section>
      )}
    </>
  );
}
