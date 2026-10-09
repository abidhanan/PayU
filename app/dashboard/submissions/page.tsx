import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatRupiah, timeAgo } from "@/lib/utils";
import { StatusBadge, EmptyState, LinkButton } from "@/components/ui";
import { CategoryIcon } from "@/components/category-icon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Submission Saya" };

export default async function SubmissionsPage() {
  const user = await requireUser();
  if (user.role !== "SEEKER") redirect("/dashboard");

  const subs = await prisma.submission.findMany({
    where: { seekerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { bounty: { include: { category: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Submission Saya</h1>
        <p className="text-sm muted">Semua karya yang pernah dikirim.</p>
      </div>

      {subs.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="Belum ada submission"
          description="Jelajahi bounty yang tersedia dan kirim karya pertamamu."
          action={<LinkButton href="/bounties">Jelajahi Bounty</LinkButton>}
        />
      ) : (
        <div className="space-y-3">
          {subs.map((s) => (
            <div key={s.id} className="card group relative p-5 transition hover:border-brand-300 dark:hover:border-brand-700">
              <Link
                href={`/bounties/${s.bounty.slug}`}
                className="absolute inset-0 z-0"
                aria-label={`Buka ${s.bounty.title}`}
              />
              <div className="pointer-events-none relative z-10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: `${s.bounty.category.color}18`, color: s.bounty.category.color }}
                    >
                      <CategoryIcon name={s.bounty.category.icon} className="h-3 w-3" />
                      {s.bounty.category.name}
                    </span>
                    <p className="mt-2 font-bold group-hover:text-brand-500">{s.bounty.title}</p>
                    <p className="text-sm muted">
                      {formatRupiah(s.bounty.bountyAmount)} · dikirim {timeAgo(s.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <a href={s.link} target="_blank" rel="noopener noreferrer" className="pointer-events-auto relative mt-3 inline-flex items-center gap-1.5 break-all text-sm text-brand-600 hover:underline dark:text-brand-300">
                  {s.link} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
                <p className="mt-1 text-sm muted">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
