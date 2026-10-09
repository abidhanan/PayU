import { DocPage } from "@/components/doc-page";

export const metadata = { title: "Kebijakan Privasi" };

export default function PrivacyPage() {
  return (
    <DocPage title="Kebijakan Privasi" subtitle="Terakhir diperbarui: 9 Agustus 2026">
      <p>
        Privasimu penting bagi kami. Halaman ini menjelaskan data apa yang kami kumpulkan dan
        bagaimana penggunaannya.
      </p>
      <h2>Data yang dikumpulkan</h2>
      <p>
        Kami menyimpan nama, email, dan informasi profil yang kamu isi, serta data aktivitas
        seperti bounty, submission, token, dan transaksi pembayaran.
      </p>
      <h2>Penggunaan data</h2>
      <p>
        Data digunakan untuk menjalankan layanan: autentikasi, menampilkan bounty & submission,
        memproses pembayaran QRIS, dan menjaga keamanan platform.
      </p>
      <h2>Pembayaran</h2>
      <p>
        Transaksi QRIS diproses oleh penyedia pembayaran pihak ketiga. Kami tidak menyimpan detail
        rekening atau kartu kamu.
      </p>
      <h2>Keamanan</h2>
      <p>
        Kata sandi disimpan dalam bentuk ter-hash. Kami menerapkan langkah wajar untuk melindungi
        data, namun tidak ada sistem yang 100% aman.
      </p>
      <h2>Kontak</h2>
      <p>
        Pertanyaan seputar privasi bisa dikirim melalui halaman <a href="/contact">Contact Us</a>.
      </p>
    </DocPage>
  );
}
