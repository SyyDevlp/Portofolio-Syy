# M. Sukron Al-Habsy — Portfolio (Gemini)

## Struktur
- `index.html`
- `api/chat.js`

## Upload ke GitHub
Upload isi folder ini ke root repository, bukan ZIP-nya saja. Pastikan `api/chat.js` berada di folder `api` dan `index.html` ada di root.

## Deploy
1. Import repository di Vercel.
2. Framework Preset: Other.
3. Build Command: kosongkan.
4. Output Directory: `.` (atau biarkan default jika Vercel mendeteksi static site).
5. Deploy.

## Aktifkan Gemini
1. Buat API key di Google AI Studio.
2. Vercel → Project → Settings → Environment Variables.
3. Tambahkan `GEMINI_API_KEY` dengan isi API key.
4. Pilih Production (dan Preview jika diperlukan), lalu Save.
5. Deployments → Redeploy deployment terbaru.

API key hanya dibaca di `api/chat.js` pada server Vercel. Jangan menaruhnya di `index.html`, GitHub, atau pesan publik.

## Catatan
Backend memakai Gemini API REST dan model `gemini-2.5-flash-lite`. Ketersediaan model dan kuota gratis bergantung pada akun/wilayah dan dapat berubah. Periksa kuota di Google AI Studio.
