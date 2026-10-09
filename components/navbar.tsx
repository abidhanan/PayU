"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, Coins, ChevronDown, Plus, User } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, LinkButton } from "./ui";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type NavUser = {
  name: string;
  email: string;
  role: "ADMIN" | "SPONSOR" | "SEEKER";
  avatarColor: string;
  image: string | null;
  tokens: number;
} | null;

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  SPONSOR: "Pemberi Kerja",
  SEEKER: "Pencari Kerja",
};

export function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close the account dropdown when clicking anywhere outside it, or on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/bounties", label: "Bounty" },
    { href: "/leaderboard", label: "Peringkat" },
    ...(user?.role === "SEEKER"
      ? [
          { href: "/dashboard/submissions", label: "Submission" },
          { href: "/dashboard/payments", label: "Pembayaran" },
        ]
      : user?.role === "SPONSOR"
      ? [
          { href: "/dashboard/bounties", label: "Bounty Saya" },
          { href: "/dashboard/payments", label: "Pembayaran" },
        ]
      : []),
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-lg"
      style={{ backgroundColor: "color-mix(in srgb, var(--bg) 82%, transparent)", borderColor: "var(--border)" }}
    >
      <nav className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="PayU beranda">
            <Logo />
          </Link>
          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition hover:surface-2",
                    pathname === l.href ? "text-brand-600 dark:text-brand-300" : "muted"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden lg:inline-flex" />

          {!user ? (
            <div className="hidden items-center gap-2 lg:flex">
              <LinkButton href="/login" variant="ghost" size="sm">
                Masuk
              </LinkButton>
              <LinkButton href="/register" size="sm">
                Daftar
              </LinkButton>
            </div>
          ) : (
            <div ref={menuRef} className="relative hidden lg:block">
              {user.role === "SPONSOR" && (
                <LinkButton href="/dashboard/post" size="sm" className="mr-2">
                  <Plus className="h-4 w-4" /> Pasang Bounty
                </LinkButton>
              )}
              {user.role === "SEEKER" && (
                <Link
                  href="/dashboard/tokens"
                  className="mr-2 inline-flex items-center gap-1.5 rounded-xl surface-2 px-3 py-2 text-sm font-semibold"
                  title="Jumlah token"
                >
                  <Coins className="h-4 w-4 text-amber-500" /> {user.tokens}
                </Link>
              )}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-xl border px-2 py-1.5 transition hover:surface-2"
                style={{ borderColor: "var(--border)" }}
                aria-expanded={menuOpen}
                aria-label="Menu akun"
              >
                <Avatar name={user.name} color={user.avatarColor} image={user.image} size={30} />
                <ChevronDown
                  className={cn("h-4 w-4 muted transition-transform duration-200", menuOpen && "rotate-180")}
                />
              </button>
              {menuOpen && (
                <div className="card absolute right-0 z-20 mt-2 w-60 p-2 reveal">
                  <div className="px-3 py-2">
                    <p className="text-sm font-bold [overflow-wrap:anywhere]">{user.name}</p>
                    <p className="text-xs muted [overflow-wrap:anywhere]">{user.email}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-300">
                      {ROLE_LABEL[user.role]}
                    </span>
                  </div>
                  <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
                  <Link href="/dashboard/profile" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:surface-2">
                    <User className="h-4 w-4" /> Profil
                  </Link>
                  <form action={logoutAction}>
                    <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:surface-2">
                      <LogOut className="h-4 w-4" /> Keluar
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border lg:hidden"
            style={{ borderColor: "var(--border)" }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile / tablet drawer */}
      {mobileOpen && (
        <div className="border-t lg:hidden" style={{ borderColor: "var(--border)" }}>
          <div className="mx-auto max-w-screen-2xl space-y-1 px-4 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname === l.href ? "surface-2 text-brand-600 dark:text-brand-300" : ""
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between rounded-lg px-3 py-2">
              <span className="text-sm muted">Tema</span>
              <ThemeToggle />
            </div>
            <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
              {!user ? (
                <div className="grid grid-cols-2 gap-2">
                  <LinkButton href="/login" variant="secondary">Masuk</LinkButton>
                  <LinkButton href="/register">Daftar</LinkButton>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 rounded-xl surface-2 px-3 py-2.5"
                  >
                    <Avatar name={user.name} color={user.avatarColor} image={user.image} size={38} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold [overflow-wrap:anywhere]">{user.name}</p>
                      <p className="text-xs muted">{ROLE_LABEL[user.role]}</p>
                    </div>
                    {user.role === "SEEKER" && (
                      <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold">
                        <Coins className="h-4 w-4 text-amber-500" /> {user.tokens}
                      </span>
                    )}
                  </Link>
                  <LinkButton href="/dashboard/profile" variant="secondary" className="w-full">
                    <User className="h-4 w-4" /> Profil
                  </LinkButton>
                  {user.role === "SPONSOR" && (
                    <LinkButton href="/dashboard/post" className="w-full">
                      <Plus className="h-4 w-4" /> Pasang Bounty
                    </LinkButton>
                  )}
                  <form action={logoutAction}>
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-red-500" style={{ borderColor: "var(--border)" }}>
                      <LogOut className="h-4 w-4" /> Keluar
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
