"use client";

import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

const ERRORS: Record<string, string> = {
  google_unconfigured: "Login Google belum dikonfigurasi. Hubungi admin.",
  google_state: "Sesi login Google tidak valid. Coba lagi.",
  google_failed: "Gagal masuk dengan Google. Coba lagi.",
  banned: "Akun Anda dinonaktifkan. Hubungi admin.",
};

export function GoogleButton({ label = "Lanjutkan dengan Google" }: { label?: string }) {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="space-y-3">
      {error && ERRORS[error] && (
        <p className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" /> {ERRORS[error]}
        </p>
      )}
      <a
        href="/api/auth/google"
        className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border font-semibold transition hover:surface-2"
        style={{ borderColor: "var(--border)" }}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
        </svg>
        {label}
      </a>
    </div>
  );
}
