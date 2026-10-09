"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Minus, Plus, Coins, QrCode } from "lucide-react";
import { createTopupPayment } from "@/lib/actions/payment";
import { Button } from "./ui";
import { formatRupiah } from "@/lib/utils";

function Pay() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      <QrCode className="h-4 w-4" />
      {pending ? "Menyiapkan QRIS..." : "Bayar"}
    </Button>
  );
}

export function TokenTopup({ tokenPrice }: { tokenPrice: number }) {
  const [qty, setQty] = useState(3);
  const total = qty * tokenPrice;
  const presets = [1, 3, 5, 10];

  return (
    <form action={createTopupPayment} className="space-y-5">
      <input type="hidden" name="qty" value={qty} />

      <div className="grid grid-cols-4 gap-2">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setQty(p)}
            className={`rounded-xl border py-3 text-center font-bold transition ${
              qty === p ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300" : "hover:surface-2"
            }`}
            style={qty === p ? undefined : { borderColor: "var(--border)" }}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center rounded-xl border" style={{ borderColor: "var(--border)" }} aria-label="Kurangi">
          <Minus className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-3xl font-extrabold">
          <Coins className="h-7 w-7 text-amber-500" /> {qty}
        </div>
        <button type="button" onClick={() => setQty((q) => Math.min(50, q + 1))} className="flex h-11 w-11 items-center justify-center rounded-xl border" style={{ borderColor: "var(--border)" }} aria-label="Tambah">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="rounded-xl surface-2 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="muted">{qty} token × {formatRupiah(tokenPrice)}</span>
          <span className="font-semibold">{formatRupiah(total)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-2 font-bold" style={{ borderColor: "var(--border)" }}>
          <span>Total</span>
          <span className="text-brand-600 dark:text-brand-300">{formatRupiah(total)}</span>
        </div>
      </div>

      <Pay />
    </form>
  );
}
