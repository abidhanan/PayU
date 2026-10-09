import { DocPage } from "@/components/doc-page";

export const metadata = { title: "FAQ" };

const QA = [
  {
    q: "Apa itu PayU?",
    a: "PayU adalah platform bounty freelance. Pemberi kerja memasang tugas berhadiah, dan pencari kerja mengerjakannya untuk memenangkan hadiah (bounty).",
  },
  {
    q: "Bagaimana sistem token bekerja?",
    a: "Setiap pencari kerja mendapat 3 token gratis yang di-reset tiap bulan. Kamu butuh minimal 1 token untuk mengirim submission. Token hanya berkurang saat kamu menang; jika kalah, token tetap utuh.",
  },
  {
    q: "Bagaimana jika token habis?",
    a: "Kamu bisa top up token kapan saja lewat halaman Token. Token hasil top up tidak hangus saat reset bulanan.",
  },
  {
    q: "Bagaimana cara pembayaran?",
    a: "Semua pembayaran (memasang bounty dan top up token) memakai QRIS, sehingga bisa dibayar dari bank atau e-wallet apa pun.",
  },
  {
    q: "Kapan pemenang menerima hadiah?",
    a: "Setelah pemberi kerja meninjau seluruh submission dan memilih pemenang, hadiah langsung tercatat pada akun pemenang.",
  },
];

export default function FaqPage() {
  return (
    <DocPage title="FAQ" subtitle="Pertanyaan yang sering diajukan seputar PayU.">
      {QA.map((item) => (
        <div key={item.q}>
          <h2>{item.q}</h2>
          <p>{item.a}</p>
        </div>
      ))}
    </DocPage>
  );
}
