import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Users, QrCode, PlusCircle, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatRupiah, deadlineInfo } from "@/lib/utils";
import { StatusBadge, EmptyState, LinkButton } from "@/components/ui";
import { CategoryIcon } from "@/components/category-icon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bounty Saya" };

export default async function MyBountiesPage() {
  const user = await requireUser();
  if (user.role !== "SPONSOR") redirect("/dashboard");

  const bounties = await prisma.bounty.findMany({
    where: { sponsorId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { submissions: true } },
      payments: { where: { status: "PENDING" }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Bounty Saya</h1>
          <p className="text-sm muted">Kelola semua bounty yang kamu pasang.</p>
        </div>
        <LinkButton href="/dashboard/post"><PlusCircle className="h-4 w-4" /> Pasang Bounty</LinkButton>
      </div>

      {bounties.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-6 w-6" />} title="Belum ada bounty" description="Pasang bounty pertamamu untuk mulai mencari talenta." action={<LinkButton href="/dashboard/post">Pasang Bounty</LinkButton>} />
      ) : (
        <div className="space-y-3">
          {bounties.map((b) => {
            const dl = deadlineInfo(b.deadline);
            const pendingPayment = b.status === "PENDING_PAYMENT" ? b.payments[0] : null;
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
                    {b.status === "PENDING_PAYMENT" ? (
                      <p className="mt-2 font-bold">{b.title}</p>
                    ) : (
                      <Link href={`/bounties/${b.slug}`} className="mt-2 flex items-center gap-1.5 font-bold hover:text-brand-500">
                        {b.title} <ExternalLink className="h-3.5 w-3.5 shrink-0 muted" />
                      </Link>
                    )}
                    <p className="mt-1 text-sm muted">
                      {formatRupiah(b.bountyAmount)} · <Users className="inline h-3.5 w-3.5" /> {b._count.submissions} submission · {dl.label}
                    </p>
                  </div>
                  {pendingPayment && (
                    <LinkButton href={`/pay/${pendingPayment.id}`} size="sm" variant="secondary">
                      <QrCode className="h-4 w-4" /> Bayar
                    </LinkButton>
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
