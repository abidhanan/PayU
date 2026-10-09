import { DocPage } from "@/components/doc-page";

export const metadata = { title: "Pembaruan" };

const RELEASES = [
  {
    version: "v1.0",
    date: "9 Agustus 2026",
    items: [
      "Peluncuran platform bounty: peran Admin, Pemberi Kerja, dan Pencari Kerja.",
      "Sistem token bulanan (3 gratis/bulan) dengan opsi top up.",
      "Pembayaran QRIS untuk memasang bounty dan top up token.",
      "Login/daftar via email dan Google.",
      "Dashboard, papan peringkat, dan panel admin.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <DocPage title="Pembaruan" subtitle="Riwayat pembaruan PayU.">
      {RELEASES.map((r) => (
        <div key={r.version}>
          <h2>
            {r.version} <span className="font-normal muted">· {r.date}</span>
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            {r.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>
      ))}
    </DocPage>
  );
}
