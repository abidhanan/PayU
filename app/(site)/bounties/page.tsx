import Link from "next/link";
import { Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { BountyCard } from "@/components/bounty-card";
import { CategoryIcon } from "@/components/category-icon";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Jelajahi Bounty" };

type SP = { category?: string; q?: string; sort?: string };

export default async function BountiesPage({ searchParams }: { searchParams: SP }) {
  const { category, q, sort } = searchParams;

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  const where: Prisma.BountyWhereInput = { status: "OPEN" };
  if (category) where.category = { slug: category };
  if (q) where.title = { contains: q };

  const orderBy: Prisma.BountyOrderByWithRelationInput =
    sort === "bounty" ? { bountyAmount: "desc" } : sort === "deadline" ? { deadline: "asc" } : { createdAt: "desc" };

  const bounties = await prisma.bounty.findMany({
    where,
    orderBy,
    include: {
      category: true,
      sponsor: { select: { name: true, avatarColor: true } },
      _count: { select: { submissions: true } },
    },
  });

  const buildHref = (patch: Partial<SP>) => {
    const params = new URLSearchParams();
    const merged = { category, q, sort, ...patch };
    if (merged.category) params.set("category", merged.category);
    if (merged.q) params.set("q", merged.q);
    if (merged.sort) params.set("sort", merged.sort);
    const s = params.toString();
    return `/bounties${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Jelajahi Bounty</h1>
        <p className="mt-2 muted">Pilih tantangan, kirim karyamu, dan menangkan hadiahnya.</p>
      </div>

      {/* Search */}
      <form action="/bounties" method="get" autoComplete="off" className="mb-5">
        {category && <input type="hidden" name="category" value={category} />}
        {sort && <input type="hidden" name="sort" value={sort} />}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 muted" />
          <input
            name="q"
            type="search"
            defaultValue={q}
            autoComplete="off"
            placeholder="Cari bounty..."
            className="input pl-11"
          />
        </div>
      </form>

      {/* Category pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href={buildHref({ category: undefined })}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
            !category ? "border-brand-500 bg-brand-500 text-white" : "hover:surface-2"
          )}
          style={!category ? undefined : { borderColor: "var(--border)" }}
        >
          Semua
        </Link>
        {categories.map((c) => {
          const active = category === c.slug;
          return (
            <Link
              key={c.id}
              href={buildHref({ category: c.slug })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                active ? "text-white" : "hover:surface-2"
              )}
              style={active ? { backgroundColor: c.color, borderColor: c.color } : { borderColor: "var(--border)" }}
            >
              <CategoryIcon name={c.icon} className="h-4 w-4" />
              {c.name}
            </Link>
          );
        })}
      </div>

      {/* Sort + count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm muted">{bounties.length} bounty ditemukan</p>
        <div className="flex items-center gap-1.5 text-sm">
          {[
            { key: undefined, label: "Terbaru" },
            { key: "bounty", label: "Hadiah tertinggi" },
            { key: "deadline", label: "Tenggat terdekat" },
          ].map((s) => (
            <Link
              key={s.label}
              href={buildHref({ sort: s.key })}
              className={cn(
                "rounded-lg px-2.5 py-1 font-medium transition",
                (sort ?? undefined) === s.key ? "surface-2 text-brand-600 dark:text-brand-300" : "muted hover:surface-2"
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {bounties.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Tidak ada bounty ditemukan"
          description="Coba ubah kata kunci atau pilih kategori lain."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bounties.map((b) => (
            <BountyCard key={b.id} bounty={b} />
          ))}
        </div>
      )}
    </div>
  );
}
