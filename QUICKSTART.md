# Quick Start Guide

## Cara Tercepat (Windows)

1. Double click file **RUN.bat**
2. Tunggu install selesai (pertama kali agak lama)
3. Website otomatis jalan di http://localhost:3000
4. Selesai!

## File RUN.bat akan otomatis:

✅ Check apakah Node.js terinstall  
✅ Install dependencies kalau belum ada  
✅ Buat file .env.local otomatis  
✅ Jalankan development server  

## Pertama kali pakai

Kalau ini pertama kali jalanin, butuh beberapa menit untuk install semua dependencies. Santai aja, normal kok.

## Next time

Kalau mau jalanin lagi tinggal double click RUN.bat lagi. Karena dependencies sudah terinstall, langsung jalan cepet!

## Stop server

Tekan **Ctrl + C** di window command prompt yang muncul.

## Troubleshooting

**Error "Node.js tidak terdeteksi"**
- Install Node.js dulu dari https://nodejs.org
- Download yang LTS version
- Restart komputer setelah install

**Port 3000 sudah dipakai**
- Ada aplikasi lain yang pakai port 3000
- Stop aplikasi itu dulu, atau
- Edit file package.json, ganti `"dev": "next dev"` jadi `"dev": "next dev -p 3001"`

**Dependencies error**
- Hapus folder `node_modules`
- Hapus file `package-lock.json`
- Jalanin RUN.bat lagi

---

Butuh bantuan? WA: 085691680974
