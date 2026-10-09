"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { simulatePaymentAction } from "@/lib/actions/payment";
import { formatRupiah } from "@/lib/utils";
import { Button, LinkButton } from "./ui";

type Props = {
  id: string;
  amount: number;
  reference: string;
  qrisImage: string;
  type: "BOUNTY_POST" | "TOKEN_TOPUP";
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  expiresAt: string;
  bountySlug: string | null;
  simulated: boolean;
  description: string;
};

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function PaymentClient(props: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(props.status);
  const [remaining, setRemaining] = useState(() => new Date(props.expiresAt).getTime() - Date.now());
  const [pending, startTransition] = useTransition();

  const successTarget =
    props.type === "BOUNTY_POST"
      ? props.bountySlug
        ? `/bounties/${props.bountySlug}`
        : "/dashboard/bounties"
      : "/dashboard/tokens";

  // Countdown
  useEffect(() => {
    if (status !== "PENDING") return;
    const t = setInterval(() => setRemaining(new Date(props.expiresAt).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [status, props.expiresAt]);

  // Poll status
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/payment/${props.id}/status`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.status && data.status !== status) setStatus(data.status);
    } catch {}
  }, [props.id, status]);

  useEffect(() => {
    if (status !== "PENDING") return;
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [status, poll]);

  // Redirect on success
  useEffect(() => {
    if (status === "PAID") {
      const t = setTimeout(() => {
        router.push(successTarget);
        router.refresh();
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [status, router, successTarget]);

  const simulate = () => {
    startTransition(async () => {
      const res = await simulatePaymentAction(props.id);
      if (res && "ok" in res) setStatus("PAID");
    });
  };

  if (status === "PAID") {
    return (
      <div className="card flex flex-col items-center gap-4 p-10 text-center reveal">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
          <CheckCircle2 className="h-11 w-11" />
        </span>
        <h1 className="text-2xl font-extrabold">Pembayaran Berhasil!</h1>
        <p className="max-w-sm muted">
          {props.type === "BOUNTY_POST"
            ? "Bounty kamu sekarang tayang dan siap menerima submission."
            : "Token kamu sudah ditambahkan. Selamat mengerjakan bounty!"}
        </p>
        <p className="flex items-center gap-2 text-sm muted"><Loader2 className="h-4 w-4 animate-spin" /> Mengalihkan...</p>
        <LinkButton href={successTarget}>Lanjutkan</LinkButton>
      </div>
    );
  }

  if (status === "EXPIRED" || status === "FAILED") {
    return (
      <div className="card flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15 text-red-500">
          <XCircle className="h-11 w-11" />
        </span>
        <h1 className="text-2xl font-extrabold">Pembayaran {status === "EXPIRED" ? "Kadaluarsa" : "Gagal"}</h1>
        <p className="max-w-sm muted">QRIS sudah tidak berlaku. Silakan ulangi transaksi.</p>
        <LinkButton href={props.type === "BOUNTY_POST" ? "/dashboard/post" : "/dashboard/tokens"}>Coba Lagi</LinkButton>
      </div>
    );
  }

  const expired = remaining <= 0;

  return (
    <div className="card overflow-hidden p-0">
      <div className="bg-brand-600 px-6 py-5 text-center text-white">
        <p className="text-sm text-white/80">Total Pembayaran</p>
        <p className="text-3xl font-extrabold">{formatRupiah(props.amount)}</p>
        <p className="mt-1 text-xs text-white/70">{props.description}</p>
      </div>

      <div className="flex flex-col items-center gap-4 p-6">
        <div className="flex items-center gap-2 rounded-full surface-2 px-3 py-1.5 text-sm font-semibold">
          <Clock className={`h-4 w-4 ${expired ? "text-red-500" : "text-brand-500"}`} />
          {expired ? "Kadaluarsa" : `Berlaku ${fmt(remaining)}`}
        </div>

        <div className="rounded-2xl border-4 border-brand-500/10 bg-white p-3">
          {/* data URL image — plain img is correct here */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.qrisImage} alt="Kode QRIS pembayaran" width={280} height={280} className="h-[260px] w-[260px]" />
        </div>

        <div className="flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-300">
          <span className="rounded bg-brand-500 px-1.5 py-0.5 text-[10px] text-white">QRIS</span>
          Scan untuk membayar
        </div>
        <p className="text-center text-sm muted">
          Buka aplikasi bank / e-wallet apa pun (GoPay, OVO, DANA, ShopeePay, mobile banking),
          pilih <b>Scan QRIS</b>, lalu bayar.
        </p>

        <div className="w-full rounded-xl surface-2 p-3 text-center text-xs muted">
          Ref: <span className="font-mono font-semibold text-[color:var(--text)]">{props.reference}</span>
        </div>

        <div className="flex items-center gap-2 text-xs muted">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Transaksi aman & terenkripsi
        </div>

        <div className="flex items-center gap-2 pt-1 text-sm muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Menunggu pembayaran...
        </div>

        {props.simulated && !expired && (
          <div className="mt-2 w-full rounded-xl border border-dashed p-4 text-center" style={{ borderColor: "var(--border)" }}>
            <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-500">
              <Sparkles className="h-3.5 w-3.5" /> Mode Demo
            </p>
            <p className="mb-3 text-xs muted">Gateway belum dikonfigurasi. Simulasikan pembayaran berhasil untuk mencoba alurnya.</p>
            <Button onClick={simulate} disabled={pending} variant="secondary" className="w-full">
              {pending ? "Memproses..." : "Simulasikan Bayar Berhasil"}
            </Button>
          </div>
        )}

        <Link href="/dashboard" className="text-sm muted hover:text-brand-500">Bayar nanti</Link>
      </div>
    </div>
  );
}
