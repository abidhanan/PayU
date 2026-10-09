"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Coins,
  PlusCircle,
  Shield,
  Compass,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "ADMIN" | "SPONSOR" | "SEEKER";

const ITEMS: Record<Role, { href: string; label: string; icon: any }[]> = {
  SEEKER: [
    { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/dashboard/tokens", label: "Token", icon: Coins },
    { href: "/dashboard/profile", label: "Profil", icon: User },
    { href: "/bounties", label: "Jelajahi Bounty", icon: Compass },
  ],
  SPONSOR: [
    { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/dashboard/bounties", label: "Bounty Saya", icon: FileText },
    { href: "/dashboard/post", label: "Pasang Bounty", icon: PlusCircle },
    { href: "/dashboard/profile", label: "Profil", icon: User },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "Profil", icon: User },
    { href: "/admin", label: "Panel Admin", icon: Shield },
  ],
};

export function DashboardNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = ITEMS[role];

  return (
    <nav className="lg:sticky lg:top-20">
      <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href} className="shrink-0">
              <Link
                href={it.href}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand-500 text-white shadow-glow"
                    : "muted hover:surface-2"
                )}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
