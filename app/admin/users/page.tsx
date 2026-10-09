import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { UserManager } from "@/components/admin/user-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const me = await requireUser();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Pengguna</h1>
        <p className="text-sm muted">Kelola peran, token, dan status akun pengguna.</p>
      </div>
      <UserManager
        meId={me.id}
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatarColor: u.avatarColor,
          image: u.image,
          banned: !!u.bannedAt,
          tokens: u.role === "SEEKER" ? u.freeTokens + u.paidTokens : null,
        }))}
      />
    </div>
  );
}
