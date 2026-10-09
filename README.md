# PayU — Platform Bounty Freelance 💙

Platform bounty freelance ala **Superteam** dengan tema brand **PayU** (biru royal),
dukungan **mode gelap/terang**, responsif penuh (mobile + desktop), dan pembayaran **QRIS**.

Dibangun dengan **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · SQLite**.

---

## ✨ Fitur

### 3 Peran
| Peran | Kemampuan |
|-------|-----------|
| **Admin** | Dashboard statistik, kelola kategori, pengguna (ubah peran / nonaktifkan / beri token), moderasi bounty, lihat semua pembayaran, atur biaya & harga token. |
| **Pemberi Kerja (Sponsor)** | Pasang bounty per kategori, bayar **hadiah + biaya admin** via QRIS, tinjau submission, pilih pemenang. |
| **Pencari Kerja (Seeker)** | Jelajahi bounty, kirim karya, menangkan hadiah, kelola & top up token. |

### Sistem Token
- Setiap pencari kerja mendapat **3 token gratis** yang **di-reset otomatis tiap bulan**.
- **Menang → 1 token berkurang** (token gratis dipakai lebih dulu, lalu token berbayar).
- **Kalah → token tetap.**
- Butuh **minimal 1 token** untuk mengirim submission.
- Bisa **top up token** kapan saja via QRIS (token berbayar tidak hangus saat reset bulanan).

### Pembayaran QRIS
- Integrasi ke gateway **pay.xoftware.id** (lihat konfigurasi di bawah).
- Menghasilkan **QRIS EMVCo** yang valid + gambar QR, dengan countdown kedaluwarsa 30 menit.
- **Webhook** `/api/payment/callback` untuk notifikasi gateway + **polling status** real-time.
- **Mode Simulasi** aktif otomatis bila API key belum diisi — seluruh alur bisa dites tanpa gateway nyata.

### Lainnya
- **Login/daftar dengan Google** (OAuth 2.0) selain email/kata sandi.
- **Edit profil**: ubah nama, bio, warna avatar, dan kata sandi.
- Papan peringkat (leaderboard) pencari kerja.
- UI bertema logo, mode gelap/terang dengan anti-flicker, dropdown dengan animasi panah.
- Dioptimasi untuk **Lighthouse 90+** (SSR, ~94 kB JS awal, font sistem, tanpa layout shift).

### Deploy
Panduan lengkap ke **Vercel + Neon Postgres**, plus persiapan Google OAuth & pembayaran
xoftware, ada di **[DEPLOY.md](DEPLOY.md)**. Untuk produksi, database berpindah dari SQLite
ke **PostgreSQL (Neon)** — cukup ganti `provider` di `prisma/schema.prisma` menjadi `postgresql`.

---

## 🚀 Menjalankan

```bash
npm install
npm run db:reset   # buat + isi database demo (SQLite)
npm run dev        # mode pengembangan  → http://localhost:3000
# atau
npm run build && npm run start   # mode produksi
```

### Akun Demo
| Peran | Email | Kata sandi |
|-------|-------|-----------|
| Admin | `admin@payu.id` | `password123` |
| Pemberi Kerja | `sponsor@payu.id` | `password123` |
| Pencari Kerja | `seeker@payu.id` | `password123` |

---

## 💳 Konfigurasi Pembayaran (pay.xoftware.id)

Aplikasi berjalan dalam **mode simulasi** selama `PAYMENT_API_KEY` kosong (default) —
sempurna untuk demo/testing. Untuk mengaktifkan pembayaran QRIS nyata, isi `.env`:

```env
PAYMENT_API_BASE="https://pay.xoftware.id"
PAYMENT_API_KEY="<api-key-dari-dashboard-pay.xoftware.id>"
PAYMENT_MERCHANT_ID="<merchant-id>"
APP_URL="https://domain-produksi-anda.com"
```

Titik integrasi ada di [`lib/payment.ts`](lib/payment.ts) (`createQrisPayment`) dan
webhook di [`app/api/payment/callback/route.ts`](app/api/payment/callback/route.ts).
Nama field request/response mengikuti pola gateway QRIS Indonesia pada umumnya —
sesuaikan bila dokumentasi resmi gateway berbeda.

---

## 🗂️ Struktur

```
app/
  (site)/        Beranda, jelajah bounty, detail bounty, leaderboard  (publik)
  (auth)/        Masuk & Daftar
  dashboard/     Dashboard per-peran (seeker/sponsor/admin) + post & top up
  admin/         Panel admin (kategori, pengguna, bounty, pembayaran, pengaturan)
  pay/[id]/      Halaman pembayaran QRIS
  api/payment/   Status polling + webhook callback
components/      UI, navbar, kartu bounty, form, tema, dll.
lib/             db, auth (JWT), session, payment, tokens, settings, server actions
prisma/          schema.prisma + seed.ts
```

## ⚙️ Env penting
- `DATABASE_URL` — koneksi SQLite (`file:./dev.db`).
- `JWT_SECRET` — **wajib diganti** di produksi.
