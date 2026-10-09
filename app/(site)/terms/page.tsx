import { DocPage } from "@/components/doc-page";

export const metadata = { title: "Ketentuan" };

export default function TermsPage() {
  return (
    <DocPage title="Syarat & Ketentuan" subtitle="Terakhir diperbarui: 9 Agustus 2026">
      <p>
        Dengan menggunakan PayU, kamu menyetujui syarat dan ketentuan berikut. Mohon dibaca
        sebelum memasang atau mengerjakan bounty.
      </p>
      <h2>1. Akun</h2>
      <p>
        Kamu bertanggung jawab menjaga kerahasiaan akun dan seluruh aktivitas di dalamnya.
        Satu orang tidak diperkenankan menyalahgunakan beberapa akun untuk memanipulasi hasil bounty.
      </p>
      <h2>2. Bounty & Pembayaran</h2>
      <p>
        Pemberi kerja membayar hadiah bounty beserta biaya admin di muka melalui QRIS. Bounty
        akan tayang setelah pembayaran berhasil. Nilai hadiah yang tertera adalah jumlah yang
        diterima pemenang.
      </p>
      <h2>3. Penilaian & Pemenang</h2>
      <p>
        Pemberi kerja berhak menentukan pemenang berdasarkan kualitas submission. Keputusan
        pemenang bersifat final. Menang mengurangi 1 token pencari kerja; kalah tidak mengurangi token.
      </p>
      <h2>4. Konten</h2>
      <p>
        Kamu menjamin bahwa karya yang dikirim adalah orisinal dan tidak melanggar hak pihak lain.
        PayU dapat menghapus konten atau menonaktifkan akun yang melanggar ketentuan.
      </p>
      <h2>5. Perubahan</h2>
      <p>
        Ketentuan ini dapat berubah sewaktu-waktu. Perubahan penting akan diinformasikan melalui
        platform.
      </p>
    </DocPage>
  );
}
