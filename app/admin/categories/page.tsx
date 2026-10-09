import { prisma } from "@/lib/db";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { bounties: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Kategori</h1>
        <p className="text-sm muted">Kelola kategori bounty yang tersedia di platform.</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
