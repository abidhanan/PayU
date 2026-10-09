import { Mail, MessageCircle, Building2 } from "lucide-react";
import { DocPage } from "@/components/doc-page";

export const metadata = { title: "Kontak" };

export default function ContactPage() {
  return (
    <DocPage title="Hubungi Kami" subtitle="Punya pertanyaan, masukan, atau kendala? Kami siap membantu.">
      <p>Tim PayU biasanya membalas dalam 1×24 jam pada hari kerja.</p>

      <div className="not-prose mt-2 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <Mail className="h-5 w-5 text-brand-500" />
          <p className="mt-2 font-semibold text-[color:var(--text)]">Email</p>
          <a href="mailto:halo@payu.id" className="text-brand-600 hover:underline dark:text-brand-300">halo@payu.id</a>
        </div>
        <div className="card p-5">
          <MessageCircle className="h-5 w-5 text-brand-500" />
          <p className="mt-2 font-semibold text-[color:var(--text)]">Dukungan</p>
          <span>Live chat (Sen–Jum, 09.00–17.00 WIB)</span>
        </div>
        <div className="card p-5">
          <Building2 className="h-5 w-5 text-brand-500" />
          <p className="mt-2 font-semibold text-[color:var(--text)]">Kerja sama</p>
          <a href="mailto:partner@payu.id" className="text-brand-600 hover:underline dark:text-brand-300">partner@payu.id</a>
        </div>
      </div>
    </DocPage>
  );
}
