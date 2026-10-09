import Link from "next/link";
import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-4 text-center">
      <Link href="/"><Logo size="lg" /></Link>
      <div>
        <p className="text-6xl font-extrabold text-brand-500">404</p>
        <h1 className="mt-2 text-2xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-1 muted">Maaf, halaman yang kamu cari tidak tersedia.</p>
      </div>
      <LinkButton href="/">Kembali ke Beranda</LinkButton>
    </div>
  );
}
