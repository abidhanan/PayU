import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AdminNav } from "@/components/admin-nav";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Panel Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-300">
          <Shield className="h-4 w-4" /> Panel Admin
        </div>
        <div className="mb-6 border-b pb-3" style={{ borderColor: "var(--border)" }}>
          <AdminNav />
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
