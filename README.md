# Elora Wedding

Website untuk bisnis wedding content creator. Dibuat dengan Next.js 14 dan Tailwind CSS.

## Cara Install & Jalankan

**Yang paling gampang:** Double click file `RUN.bat` - selesai!

**Manual:**
```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Fitur

- Landing page & halaman paket layanan
- Form booking dengan validasi
- Kalender availability 
- Upload bukti pembayaran
- Portfolio & galeri
- Halaman kontak dengan WhatsApp integration
- Admin dashboard untuk manage pesanan

## Setup Google Sheets (Opsional)

Kalau mau data booking tersimpan di Google Sheets:

1. Buat spreadsheet baru di Google Sheets
2. Sheet pertama kasih nama "Bookings"
3. Row pertama isi header ini:
   ```
   ID | Full Name | Email | WhatsApp | Wedding Date | Package ID | Package Name | Notes | Status | Payment Status | Payment Proof | Drive Link | Created At
   ```
4. Extensions > Apps Script
5. Copy paste kode dari file `google-apps-script.js`
6. Deploy > New deployment > Web app
7. Execute as: Me, Who has access: Anyone
8. Copy URL deployment nya
9. Buat file `.env.local` isi kayak gini:
   ```
   NEXT_PUBLIC_GOOGLE_SCRIPT_URL=paste_url_tadi_disini
   ADMIN_PASSWORD=admin123
   ```

Done! Sekarang setiap booking akan masuk ke spreadsheet.

## Konfigurasi

**Ganti paket & harga:** Edit `lib/config.ts`

**Ganti nomor WhatsApp:** Cari `WHATSAPP_NUMBER` di `lib/config.ts`

**Admin password:** Set di `.env.local`

**Warna tema:** Edit CSS variables di `app/globals.css`

## Admin Dashboard

Buka `/admin` lalu login pakai password (default: admin123)

Di sini bisa:
- Lihat semua booking
- Update status pesanan
- Verifikasi pembayaran
- Kasih link Google Drive untuk hasil foto/video

## Deploy

**Vercel (recommended):**
1. Push ke GitHub
2. Import di vercel.com
3. Tambah environment variables
4. Deploy

**Netlify:**
1. `npm run build`
2. Upload ke Netlify
3. Set environment variables

## Kontak

- WhatsApp: 085691680974
- Email: info@elorawedding.com
- Instagram: @elorawedding
- TikTok: @elorawedding

## Tech Stack

Next.js 14, TypeScript, Tailwind CSS, React Icons, date-fns

---

Need help? Chat aja via WhatsApp.
