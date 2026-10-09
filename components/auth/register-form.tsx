"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, UserPlus, Briefcase, Search } from "lucide-react";
import { registerAction, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui";
import { GoogleButton } from "./google-button";
import { cn } from "@/lib/utils";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      <UserPlus className="h-4 w-4" /> {pending ? "Membuat akun..." : "Buat Akun"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, action] = useFormState<AuthState, FormData>(registerAction, null);
  const [role, setRole] = useState<"SEEKER" | "SPONSOR">("SEEKER");

  const roles = [
    { key: "SEEKER" as const, icon: Search, title: "Pencari Kerja", desc: "Kerjakan bounty & menangkan hadiah" },
    { key: "SPONSOR" as const, icon: Briefcase, title: "Pemberi Kerja", desc: "Pasang tugas & cari talenta" },
  ];

  return (
    <div className="card p-7 sm:p-8">
      <h1 className="text-2xl font-extrabold">Buat akun PayU</h1>
      <p className="mt-1 text-sm muted">Gratis. Dapatkan 3 token setiap bulan.</p>

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="role" value={role} />
        <div>
          <span className="label">Saya ingin bergabung sebagai</span>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((r) => (
              <button
                type="button"
                key={r.key}
                onClick={() => setRole(r.key)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition",
                  role === r.key ? "border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/20" : "hover:surface-2"
                )}
                style={role === r.key ? undefined : { borderColor: "var(--border)" }}
              >
                <r.icon className={cn("h-5 w-5", role === r.key ? "text-brand-500" : "muted")} />
                <span className="text-sm font-bold">{r.title}</span>
                <span className="text-xs muted">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="name">Nama Lengkap</label>
          <input id="name" name="name" required autoComplete="name" placeholder="Nama kamu" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="kamu@email.com" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Kata Sandi</label>
          <input id="password" name="password" type="password" required autoComplete="new-password" placeholder="Minimal 6 karakter" className="input" />
        </div>
        {state?.error && (
          <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
          </p>
        )}
        <Submit />
      </form>

      <div className="my-5 flex items-center gap-3 text-xs muted">
        <span className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
        atau
        <span className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
      </div>
      <GoogleButton label="Daftar dengan Google" />

      <p className="mt-5 text-center text-sm muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
          Masuk
        </Link>
      </p>
    </div>
  );
}
