KRSwitch - Frontend 🔄
Aplikasi berbasis React untuk memfasilitasi pertukaran jadwal KRS mahasiswa IPB. Proyek ini menggunakan Vite, Tailwind CSS v4, dan React Router.

📋 Prasyarat
Sebelum menjalankan proyek, pastikan kamu sudah menginstal:

Node.js (versi 18 atau terbaru)

npm atau yarn

🚀 Cara Setup Lokal
Clone Repositori:

Bash
git clone https://github.com/DeatWalls-Azka/KRSwap.git
cd KRSwap/krswitch-frontend
Instal Library: Instal semua dependensi termasuk Axios dan Socket.io yang sudah disiapkan:

Bash
npm install
Menjalankan Aplikasi: Jalankan server development:

Bash
npm run dev
Buka http://localhost:5173 di browser kamu.

🛠️ Library Utama yang Digunakan
Tailwind CSS v4: Untuk styling modern tanpa file konfigurasi JS yang rumit.

React Router Dom v7: Untuk navigasi antar halaman (Dashboard, Login, Admin).

Axios: Untuk koneksi ke API backend.

Socket.io-client: Untuk fitur tukar jadwal secara real-time.

📁 Struktur Folder Utama
/src/pages: Halaman Login, Dashboard Utama, dan Admin.

/src/components: Komponen reusable seperti Navbar dan Card.

/src/api: Konfigurasi Axios dan Socket.io.