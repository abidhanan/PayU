import { Trophy, Medal, Crown } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import { Avatar, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Papan Peringkat" };

export default async function LeaderboardPage() {
  const seekers = await prisma.user.findMany({
    where: { role: "SEEKER", earnings: { gt: 0 } },
    orderBy: { earnings: "desc" },
    take: 50,
    select: {
      id: true, name: true, avatarColor: true, image: true, earnings: true,
      _count: { select: { wonBounties: true } },
    },
  });

  const podium = seekers.slice(0, 3);
  const rest = seekers.slice(3);
  const medal = ["#f59e0b", "#94a3b8", "#b45309"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
          <Trophy className="h-7 w-7" />
        </span>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Papan Peringkat</h1>
        <p className="mt-2 muted">Penghasil bounty tertinggi.</p>
      </div>

      {seekers.length === 0 ? (
        <EmptyState icon={<Trophy className="h-6 w-6" />} title="Belum ada pemenang" description="Jadilah yang pertama memenangkan bounty!" />
      ) : (
        <>
          {podium.length > 0 && (
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {podium.map((s, i) => (
                <div key={s.id} className={`card flex flex-col items-center gap-2 p-6 text-center ${i === 0 ? "sm:order-2 sm:-mt-3 border-2" : i === 1 ? "sm:order-1" : "sm:order-3"}`} style={i === 0 ? { borderColor: "#f59e0b" } : undefined}>
                  {i === 0 ? <Crown className="h-6 w-6" style={{ color: medal[i] }} /> : <Medal className="h-6 w-6" style={{ color: medal[i] }} />}
                  <Avatar name={s.name} color={s.avatarColor} image={s.image} size={56} />
                  <p className="font-bold">{s.name}</p>
                  <p className="text-lg font-extrabold text-brand-600 dark:text-brand-300">{formatRupiah(s.earnings)}</p>
                  <p className="text-xs muted">{s._count.wonBounties} kemenangan</p>
                </div>
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <div className="card divide-y p-0" style={{ borderColor: "var(--border)" }}>
              {rest.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 p-4">
                  <span className="w-6 text-center font-bold muted">{i + 4}</span>
                  <Avatar name={s.name} color={s.avatarColor} image={s.image} size={40} />
                  <div className="flex-1">
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs muted">{s._count.wonBounties} kemenangan</p>
                  </div>
                  <p className="font-bold text-brand-600 dark:text-brand-300">{formatRupiah(s.earnings)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
