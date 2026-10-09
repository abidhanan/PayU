import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PostBountyForm } from "@/components/post-bounty-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pasang Bounty" };

export default async function PostPage() {
  const user = await requireUser();
  if (user.role !== "SPONSOR") redirect("/dashboard");

  const [categories, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    getSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Pasang Bounty Baru</h1>
        <p className="text-sm muted">Buat tugas berhadiah dan temukan talenta terbaik.</p>
      </div>
      <PostBountyForm categories={categories} adminFeePercent={settings.adminFeePercent} minBounty={settings.minBounty} />
    </div>
  );
}
