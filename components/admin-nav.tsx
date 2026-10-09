"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FolderTree, Users, Briefcase, Receipt, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Ringkasan", icon: LayoutGrid },
  { href: "/admin/categories", label: "Kategori", icon: FolderTree },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/bounties", label: "Bounty", icon: Briefcase },
  { href: "/admin/payments", label: "Pembayaran", icon: Receipt },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav>
      <ul className="flex gap-1 overflow-x-auto pb-1">
        {ITEMS.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href} className="shrink-0">
              <Link
                href={it.href}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                  active ? "bg-brand-500 text-white shadow-glow" : "muted hover:surface-2"
                )}
              >
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
