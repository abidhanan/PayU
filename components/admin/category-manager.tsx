"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { createCategoryAction, deleteCategoryAction } from "@/lib/actions/admin";
import { CategoryIcon, CATEGORY_ICONS } from "@/components/category-icon";
import { Button } from "@/components/ui";

type Cat = { id: string; name: string; icon: string; color: string; _count: { bounties: number } };

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Plus className="h-4 w-4" /> {pending ? "Menyimpan..." : "Tambah Kategori"}
    </Button>
  );
}

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const [state, action] = useFormState(createCategoryAction, null);
  const [icon, setIcon] = useState("sparkles");
  const [color, setColor] = useState("#2f56f5");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const remove = (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    setErr(null);
    start(async () => {
      const res = await deleteCategoryAction(id);
      if (res?.error) setErr(res.error);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="card overflow-hidden p-0">
        <div className="border-b p-4 font-bold" style={{ borderColor: "var(--border)" }}>
          Daftar Kategori ({categories.length})
        </div>
        {err && <p className="border-b bg-red-500/10 px-4 py-2 text-sm text-red-500" style={{ borderColor: "var(--border)" }}>{err}</p>}
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${c.color}18`, color: c.color }}>
                  <CategoryIcon name={c.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs muted">{c._count.bounties} bounty</p>
                </div>
              </div>
              <button
                onClick={() => remove(c.id)}
                disabled={pending || c._count.bounties > 0}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                title={c._count.bounties > 0 ? "Kategori dipakai bounty" : "Hapus"}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form action={action} className="card h-fit space-y-4 p-6">
        <h2 className="font-bold">Tambah Kategori</h2>
        <input type="hidden" name="icon" value={icon} />
        <input type="hidden" name="color" value={color} />
        <div>
          <label className="label" htmlFor="cat-name">Nama</label>
          <input id="cat-name" name="name" required placeholder="mis. Fotografi" className="input" />
        </div>
        <div>
          <span className="label">Ikon</span>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORY_ICONS.map((ic) => (
              <button
                type="button"
                key={ic}
                onClick={() => setIcon(ic)}
                className={`flex h-11 items-center justify-center rounded-xl border transition ${icon === ic ? "border-brand-500 bg-brand-500/10 text-brand-500" : "hover:surface-2"}`}
                style={icon === ic ? undefined : { borderColor: "var(--border)" }}
              >
                <CategoryIcon name={ic} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="cat-color">Warna</label>
          <div className="flex items-center gap-3">
            <input id="cat-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border bg-transparent" style={{ borderColor: "var(--border)" }} />
            <span className="rounded-lg surface-2 px-3 py-1.5 font-mono text-sm">{color}</span>
          </div>
        </div>
        {state?.error && (
          <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
          </p>
        )}
        <AddButton />
      </form>
    </div>
  );
}
