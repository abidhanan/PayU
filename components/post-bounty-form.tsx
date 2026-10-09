"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, QrCode, Info } from "lucide-react";
import { createBountyAction, type BountyState } from "@/lib/actions/bounty";
import { Button } from "./ui";
import { Select } from "./select";
import { formatRupiah } from "@/lib/utils";

type Cat = { id: string; name: string };

function Submit({ total }: { total: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      <QrCode className="h-4 w-4" />
      {pending ? "Menyiapkan pembayaran..." : `Lanjut Bayar ${total > 0 ? formatRupiah(total) : ""}`}
    </Button>
  );
}

export function PostBountyForm({
  categories,
  adminFeePercent,
  minBounty,
}: {
  categories: Cat[];
  adminFeePercent: number;
  minBounty: number;
}) {
  const [state, action] = useFormState<BountyState, FormData>(createBountyAction, null);
  const [amount, setAmount] = useState(0);
  const fee = Math.round((amount * adminFeePercent) / 100);
  const total = amount + fee;

  // default deadline: 7 days from now, formatted for datetime-local
  const minDate = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card space-y-4 p-6">
        <div>
          <label className="label" htmlFor="title">Judul Bounty</label>
          <input id="title" name="title" required placeholder="mis. Desain logo untuk startup fintech" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="categoryId">Kategori</label>
          <Select id="categoryId" name="categoryId" required defaultValue="">
            <option value="" disabled>Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="label" htmlFor="description">Deskripsi Tugas</label>
          <textarea id="description" name="description" required rows={5} placeholder="Jelaskan tugas secara detail: konteks, tujuan, dan hasil yang diharapkan." className="input resize-none" />
        </div>
        <div>
          <label className="label" htmlFor="requirements">Persyaratan (satu per baris)</label>
          <textarea id="requirements" name="requirements" rows={4} placeholder={"Format file SVG\nMenggunakan warna brand\nDeadline ketat"} className="input resize-none" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="bountyAmount">Hadiah Bounty (Rp)</label>
            <input
              id="bountyAmount"
              name="bountyAmount"
              type="number"
              min={minBounty}
              step={1000}
              required
              placeholder={String(minBounty)}
              className="input"
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
            <p className="mt-1 text-xs muted">Minimal {formatRupiah(minBounty)}</p>
          </div>
          <div>
            <label className="label" htmlFor="deadline">Tenggat Waktu</label>
            <input id="deadline" name="deadline" type="datetime-local" required min={minDate} className="input" />
          </div>
        </div>
        {state?.error && (
          <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
          </p>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="card p-6">
          <h2 className="font-bold">Rincian Biaya</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="muted">Hadiah bounty</dt>
              <dd className="font-semibold">{formatRupiah(amount)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="muted">Biaya admin ({adminFeePercent}%)</dt>
              <dd className="font-semibold">{formatRupiah(fee)}</dd>
            </div>
            <div className="flex items-center justify-between border-t pt-2.5" style={{ borderColor: "var(--border)" }}>
              <dt className="font-bold">Total bayar</dt>
              <dd className="text-lg font-extrabold text-brand-600 dark:text-brand-300">{formatRupiah(total)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-start gap-2 rounded-lg surface-2 p-3 text-xs muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            <span>Bounty tayang setelah pembayaran QRIS berhasil. Hadiah diberikan ke pemenang yang kamu pilih.</span>
          </div>
        </div>
        <Submit total={total} />
      </aside>
    </form>
  );
}
