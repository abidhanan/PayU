# Deploy PayU ke Vercel

Panduan lengkap + daftar hal yang perlu kamu siapkan.

---

## Ringkasan yang perlu kamu siapkan

| Integrasi | Yang harus disiapkan |
|-----------|----------------------|
| **Database (Neon Postgres)** | Akun Neon → 1 project/database → **connection string** (pooled). |
| **Login Google** | Google Cloud project → OAuth Client ID (Web) → **Client ID + Client Secret** + daftar redirect URI. |
| **Pembayaran xoftware** | Akun/merchant di pay.xoftware.id → **API key** (+ merchant id) + dokumentasi endpoint & webhook mereka. |
| **Vercel** | Akun Vercel + `vercel login` di terminal ini. |

Kirimkan nilai-nilai rahasia itu, lalu deploy dijalankan.

---

## 1. Database — Neon Postgres

1. Buat akun di https://neon.tech (gratis).
2. Buat project baru → salin **connection string** (bentuknya `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`). Pakai yang **Pooled connection** untuk serverless.
3. Di project, ubah datasource Prisma ke Postgres (satu baris):

   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. Set `DATABASE_URL` = connection string Neon, lalu buat tabel + isi data awal:

   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts   # opsional: data demo
   ```

> Model tetap sama (enum disimpan sebagai String), jadi tidak ada perubahan kode lain.

---

## 2. Login Google (OAuth 2.0)

1. Buka https://console.cloud.google.com → buat / pilih project.
2. **APIs & Services → OAuth consent screen** → tipe **External** → isi nama app, email, dll → publish (mode Testing cukup untuk awal).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → Application type **Web application**.
4. Isi:
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - `https://NAMA-APP.vercel.app` (domain produksi)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/google/callback`
     - `https://NAMA-APP.vercel.app/api/auth/google/callback`
5. Salin **Client ID** dan **Client Secret** → set env `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

> Tombol "Lanjutkan dengan Google" sudah ada di halaman Masuk & Daftar. Jika env kosong, tombol menampilkan pesan "belum dikonfigurasi".

---

## 3. Pembayaran xoftware (QRIS)

1. Daftar / login merchant di https://pay.xoftware.id.
2. Ambil dari dashboard mereka: **API key** (dan **merchant id** bila ada).
3. Minta / cek **dokumentasi API** mereka: endpoint create QRIS, format request/response, dan format **webhook** notifikasi.
4. Set env:
   ```
   PAYMENT_API_BASE="https://pay.xoftware.id"
   PAYMENT_API_KEY="<api-key>"
   PAYMENT_MERCHANT_ID="<merchant-id>"
   APP_URL="https://NAMA-APP.vercel.app"
   ```
5. Daftarkan **callback/webhook URL** di dashboard xoftware:
   `https://NAMA-APP.vercel.app/api/payment/callback`
6. Sesuaikan nama field di [`lib/payment.ts`](lib/payment.ts) (`createQrisPayment`) dan [`app/api/payment/callback/route.ts`](app/api/payment/callback/route.ts) bila dokumentasi mereka berbeda dari pola umum yang dipakai. Tanpa `PAYMENT_API_KEY`, aplikasi otomatis pakai **mode simulasi**.

> Webhook butuh URL publik — inilah kenapa integrasi pembayaran nyata paling mudah dites **setelah** deploy.

---

## 4. Deploy ke Vercel

1. Login CLI: `vercel login`.
2. Set semua environment variables (via dashboard Vercel → Project → Settings → Environment Variables, atau `vercel env add`):
   - `DATABASE_URL` (Neon, pooled)
   - `JWT_SECRET` (string acak panjang — WAJIB ganti)
   - `APP_URL` (`https://NAMA-APP.vercel.app`)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `PAYMENT_API_BASE`, `PAYMENT_API_KEY`, `PAYMENT_MERCHANT_ID`
3. Deploy:
   ```bash
   vercel --prod
   ```
4. Setelah dapat domain, kembali ke Google Console & dashboard xoftware untuk memasukkan domain final (origin, redirect URI, webhook).

Build Vercel menjalankan `prisma generate && next build`. Pastikan `DATABASE_URL` sudah di-set agar runtime bisa konek ke Neon.
