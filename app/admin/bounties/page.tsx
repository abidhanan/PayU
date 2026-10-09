import Link from "next/link";
import { Users, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatRupiah, deadlineInfo } from "@/lib/utils";
import { StatusBadge, Avatar, EmptyState } from "@/components/ui";
import { CategoryIcon } from "@/components/category-icon";
import { WinnerActions } from "@/components/winner-actions";

export const dynamic = "force-dynamic";

export default async function AdminBounties() {
  const bounties = await prisma.bounty.findMany({
    where: { status: { not: "PENDING_PAYMENT" } },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      sponsor: { select: { name: true, avatarColor: true } },
      _count: { select: { submissions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Bounty</h1>
        <p className="text-sm muted">Semua bounty yang tayang di platform.</p>
      </div>

      {bounties.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="Belum ada bounty" />
      ) : (
        <div className="space-y-3">
          {bounties.map((b) => {
            const dl = deadlineInfo(b.deadline);
            return (
              <div key={b.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${b.category.color}18`, color: b.category.color }}>
                        <CategoryIcon name={b.category.icon} className="h-3 w-3" /> {b.category.name}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <Link href={`/bounties/${b.slug}`} className="mt-2 flex items-center gap-1.5 font-bold hover:text-brand-500">
                      {b.title} <ExternalLink className="h-3.5 w-3.5 shrink-0 muted" />
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm muted">
                      <span className="inline-flex items-center gap-1.5"><Avatar name={b.sponsor.name} color={b.sponsor.avatarColor} size={18} /> {b.sponsor.name}</span>
                      <span>{formatRupiah(b.bountyAmount)}</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {b._count.submissions}</span>
                      <span>{dl.label}</span>
                    </div>
                  </div>
                  {(b.status === "OPEN" || b.status === "IN_REVIEW") && (
                    <div className="w-40">
                      <WinnerActions bountyId={b.id} cancelOnly />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
