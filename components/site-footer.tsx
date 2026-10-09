import Link from "next/link";
import { prisma } from "@/lib/db";
import { Logo } from "./logo";

const ABOUT = [
  { href: "/faq", label: "FAQ" },
  { href: "/terms", label: "Ketentuan" },
  { href: "/privacy", label: "Kebijakan Privasi" },
  { href: "/changelog", label: "Pembaruan" },
  { href: "/contact", label: "Kontak" },
];

export async function SiteFooter() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    take: 6,
    select: { name: true, slug: true },
  });

  return (
    <footer className="mt-20 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm muted">Platform freelance untuk talenta Indonesia.</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">Platform</h3>
            <ul className="space-y-2 text-sm muted">
              <li><Link href="/" className="hover:text-brand-500">Beranda</Link></li>
              <li><Link href="/bounties" className="hover:text-brand-500">Bounty</Link></li>
              <li><Link href="/leaderboard" className="hover:text-brand-500">Peringkat</Link></li>
              <li><Link href="/dashboard/submissions" className="hover:text-brand-500">Submission</Link></li>
              <li><Link href="/dashboard/payments" className="hover:text-brand-500">Pembayaran</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">Kategori</h3>
            <ul className="space-y-2 text-sm muted">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/bounties?category=${c.slug}`} className="hover:text-brand-500">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold">Tentang</h3>
            <ul className="space-y-2 text-sm muted">
              {ABOUT.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="hover:text-brand-500">{a.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-sm muted" style={{ borderColor: "var(--border)" }}>
          <p>© {new Date().getFullYear()} PayU. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
