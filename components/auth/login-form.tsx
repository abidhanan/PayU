"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, LogIn } from "lucide-react";
import { loginAction, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui";
import { GoogleButton } from "./google-button";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      <LogIn className="h-4 w-4" /> {pending ? "Memproses..." : "Masuk"}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState<AuthState, FormData>(loginAction, null);

  return (
    <div className="card p-7 sm:p-8">
      <h1 className="text-2xl font-extrabold">Selamat datang kembali</h1>
      <p className="mt-1 text-sm muted">Masuk untuk melanjutkan ke PayU.</p>

      <form action={action} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="kamu@email.com" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Kata Sandi</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className="input" />
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
      <GoogleButton />

      <p className="mt-5 text-center text-sm muted">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
          Daftar gratis
        </Link>
      </p>

      <div className="mt-6 rounded-xl surface-2 p-4 text-xs muted">
        <p className="font-semibold text-[color:var(--text)]">Akun demo:</p>
        <p className="mt-1">admin@payu.id · sponsor@payu.id · seeker@payu.id</p>
        <p>Kata sandi semua: <b>password123</b></p>
      </div>
    </div>
  );
}
