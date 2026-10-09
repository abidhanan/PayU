"use client";

import { useTransition, useState } from "react";
import { Ban, ShieldCheck, Coins, ChevronDown } from "lucide-react";
import { setUserRoleAction, toggleBanAction, grantTokensAction } from "@/lib/actions/admin";
import { Avatar } from "@/components/ui";

type U = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  image: string | null;
  banned: boolean;
  tokens: number | null;
};

const ROLES = [
  { key: "SEEKER", label: "Pencari Kerja" },
  { key: "SPONSOR", label: "Pemberi Kerja" },
  { key: "ADMIN", label: "Admin" },
];

export function UserManager({ users, meId }: { users: U[]; meId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string; ok?: boolean } | void>) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res && "error" in res && res.error) setError(res.error);
    });
  };

  return (
    <div className="card overflow-hidden p-0">
      {error && <p className="border-b bg-red-500/10 px-4 py-2 text-sm text-red-500" style={{ borderColor: "var(--border)" }}>{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left muted" style={{ borderColor: "var(--border)" }}>
              <th className="p-4 font-semibold">Pengguna</th>
              <th className="p-4 font-semibold">Peran</th>
              <th className="p-4 font-semibold">Token</th>
              <th className="p-4 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
            {users.map((u) => {
              const isMe = u.id === meId;
              return (
                <tr key={u.id} className={u.banned ? "opacity-60" : ""}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} color={u.avatarColor} image={u.image} size={36} />
                      <div className="min-w-0">
                        <p className="font-semibold">{u.name} {isMe && <span className="text-xs muted">(kamu)</span>}</p>
                        <p className="text-xs muted [overflow-wrap:anywhere]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="relative inline-block">
                      <select
                        defaultValue={u.role}
                        disabled={isMe || pending}
                        onChange={(e) => run(() => setUserRoleAction(u.id, e.target.value as any))}
                        className="peer cursor-pointer appearance-none rounded-lg border bg-transparent py-1.5 pl-2.5 pr-8 text-sm disabled:opacity-50"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 muted transition-transform duration-200 peer-focus:rotate-180" />
                    </div>
                  </td>
                  <td className="p-4">
                    {u.role === "SEEKER" ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-semibold"><Coins className="h-3.5 w-3.5 text-amber-500" /> {u.tokens}</span>
                        <button onClick={() => run(() => grantTokensAction(u.id, 1))} disabled={pending} className="rounded-md surface-2 px-1.5 text-xs font-bold hover:brightness-95" title="Tambah 1 token">+1</button>
                      </div>
                    ) : <span className="muted">—</span>}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => run(() => toggleBanAction(u.id))}
                      disabled={isMe || pending}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${u.banned ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
                    >
                      {u.banned ? <><ShieldCheck className="h-3.5 w-3.5" /> Aktifkan</> : <><Ban className="h-3.5 w-3.5" /> Nonaktifkan</>}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
