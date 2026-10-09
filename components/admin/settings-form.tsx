"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { updateSettingsAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui";

type S = { adminFeePercent: number; minBounty: number; tokenPrice: number; freeTokens: number };

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Save className="h-4 w-4" /> {pending ? "Menyimpan..." : "Simpan Pengaturan"}
    </Button>
  );
}

export function SettingsForm({ settings }: { settings: S }) {
  const [state, action] = useFormState(updateSettingsAction, null);

  const fields = [
    { name: "adminFeePercent", label: "Biaya admin (%)", desc: "Persentase biaya yang ditambahkan ke hadiah bounty.", value: settings.adminFeePercent, min: 0, max: 50 },
    { name: "minBounty", label: "Minimal bounty (Rp)", desc: "Nilai hadiah bounty terkecil yang boleh dipasang.", value: settings.minBounty, min: 0, step: 1000 },
    { name: "tokenPrice", label: "Harga token (Rp)", desc: "Harga per token saat pencari kerja top up.", value: settings.tokenPrice, min: 1000, step: 1000 },
    { name: "freeTokens", label: "Token gratis / bulan", desc: "Jumlah token gratis yang di-reset setiap bulan.", value: settings.freeTokens, min: 0, max: 20 },
  ];

  return (
    <form action={action} className="card max-w-2xl space-y-5 p-6">
      {fields.map((f) => (
        <div key={f.name} className="grid gap-3 sm:grid-cols-[1fr_180px] sm:items-center">
          <div>
            <label className="label mb-0" htmlFor={f.name}>{f.label}</label>
            <p className="text-xs muted">{f.desc}</p>
          </div>
          <input id={f.name} name={f.name} type="number" defaultValue={f.value} min={f.min} max={f.max} step={(f as any).step ?? 1} required className="input" />
        </div>
      ))}
      {state?.error && (
        <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" /> Pengaturan tersimpan.
        </p>
      )}
      <SaveBtn />
    </form>
  );
}
