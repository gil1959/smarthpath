# SmartPath

SmartPath adalah aplikasi web pencarian rute tercepat yang memanfaatkan algoritma A* (A-Star) murni di sisi backend (Node.js) untuk memproses data jaringan jalan nyata (real-world) dari OpenStreetMap.

## Arsitektur Sistem

Aplikasi ini menggunakan arsitektur pemisahan antara Frontend dan Backend:

### 1. Backend (Node.js & Express)
Backend bertanggung jawab penuh atas logika komputasi keruangan dan rute.
*   **Penyediaan Data:** Menggunakan skrip `fetch-real-data.js` untuk mengunduh peta jalan raya (highway) dari OpenStreetMap menggunakan Overpass API. Data ini dikonversi menjadi format standar GeoJSON.
*   **Komputasi A*:** Menggunakan pustaka `geojson-path-finder`. Backend membaca graf spasial dari file GeoJSON dan secara matematis menghitung jalur terpendek dari dua titik menggunakan algoritma A*.
*   **Snap to Road:** Karena input dari peta bisa jatuh di atas gedung atau lahan kosong, backend menggunakan `Turf.js` untuk menarik titik awal dan tujuan secara otomatis ke persimpangan atau ruas jalan terdekat sebelum algoritma A* dimulai.
*   **Metadata:** Backend turut menghitung jarak pasti menggunakan `Turf.js` dan mengembalikan estimasi waktu tempuh beserta alasan logika penentuan rute.

### 2. Frontend (React & Vite)
Frontend bertanggung jawab atas antarmuka pengguna yang interaktif dan visualisasi grafis.
*   **Teknologi:** React.js dengan *build tool* Vite.
*   **Desain Antarmuka:** Menggunakan Tailwind CSS versi 4 dengan gaya desain modern, efek *glassmorphism*, dan transisi halus untuk pengalaman pengguna premium.
*   **Peta Interaktif:** Mengandalkan `react-leaflet` dan `Leaflet.js` untuk merender ubin peta dari penyedia pihak ketiga (CartoDB Voyager) dan menggambar garis rute (Polyline) hasil dari komputasi A*.
*   **Pencarian (Geocoding):** Terintegrasi langsung dengan API Nominatim dari OpenStreetMap. Pengguna tidak perlu mengeklik peta secara manual; mereka dapat mengetikkan nama jalan atau institusi (seperti "Universitas Bengkulu"), dan sistem akan menyarankan koordinat secara akurat.

## Panduan Instalasi dan Penggunaan

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di lingkungan lokal.

### Bagian 1: Konfigurasi Backend

1. Buka terminal dan masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Unduh data peta jalan yang nyata (saat ini dikonfigurasi untuk kota Bengkulu):
   ```bash
   node scripts/fetch-real-data.js
   ```
   *Perintah ini akan membuat file `network.geojson`.*
4. Jalankan server:
   ```bash
   node index.js
   ```
   *Server akan menyala pada http://localhost:3000.*

### Bagian 2: Konfigurasi Frontend

1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Jalankan peladen pengembangan Vite:
   ```bash
   npm run dev
   ```
   *Aplikasi akan menyala pada http://localhost:5173.*

## Batasan Pengembangan
Sesuai dengan kriteria desain profesional awal, seluruh repositori dan antarmuka pengguna dibangun secara ketat tanpa melibatkan satupun penggunaan emoji.
