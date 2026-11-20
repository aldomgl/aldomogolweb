# 🌐 Website Pribadi Aldo Mogol
### Dilengkapi dengan HTML5 Modern, CSS3 Glassmorphism, JavaScript ES6+ Interaktif, dan Basis Data Relasional SQLite

Website portofolio dan profil pribadi profesional yang dirancang lengkap dengan integrasi antarmuka front-end modern, RESTful API backend, serta basis data SQLite untuk penyimpanan data dinamis secara persisten.

---

## 🚀 Fitur Utama

1. **Antarmuka Modern & Responsif (CSS3 + Glassmorphism)**:
   - Dukungan tema ganda: **Mode Gelap (Dark Mode)** dan **Mode Terang (Light Mode)** dengan penyimpanan preferensi di `localStorage`.
   - Efek visual *glassmorphism*, kartu mengambang (*floating badges*), tata letak CSS Grid & Flexbox yang optimal di desktop, tablet, maupun ponsel.
   - Efek ketik dinamis (*typing animation*) pada judul profil.

2. **Interaktivitas Penuh (JavaScript ES6+)**:
   - Filter portofolio proyek berdasarkan kategori (*Web App, Tools, IoT / Sistem*).
   - Filter keahlian teknis (*Frontend, Backend, Database, Tools*).
   - Modal interaktif untuk melihat detail lengkap proyek.
   - Indikator status koneksi server & database secara *real-time* (🟢 Online / 🟡 Standby).
   - Sistem notifikasi *Toast* animasi untuk umpan balik instan ke pengguna.
   - Fitur cetak/unduh Curriculum Vitae (CV) siap pakai.

3. **Basis Data SQLite Terintegrasi (Backend REST API)**:
   - **Tabel `profile`**: Menyimpan nama, bio, jabatan, kontak, dan tautan sosial.
   - **Tabel `skills`**: Menyimpan daftar keahlian, kategori, tingkat persentase kemahiran, dan ikon.
   - **Tabel `projects`**: Menyimpan portofolio proyek lengkap dengan tag teknologi, tautan demo, dan repositori GitHub.
   - **Tabel `experiences`**: Menyimpan riwayat karir dan pendidikan.
   - **Tabel `messages`**: Buku tamu & formulir kontak yang menyimpan pesan dari pengunjung langsung ke database.

4. **Panel Manajemen Database & Admin (CMS)**:
   - Tombol **"Admin DB"** di pojok kanan atas navbar (PIN Default: `1234`).
   - Membaca dan menghapus pesan masuk dari pengunjung.
   - Menambah proyek baru langsung ke database tanpa perlu mengedit kode.
   - Menambah keahlian baru ke database.
   - Mengedit bio dan informasi kontak langsung ke database.

---

## 📁 Struktur Direktori

```text
aldomogolweb/
├── server.py              # Server web HTTP + REST API dengan SQLite (Python built-in)
├── init_db.py             # Script inisialisasi tabel dan seeding data awal ke database
├── database.db            # File basis data relasional SQLite
├── run.bat                # Shortcut sekali-klik untuk menjalankan server di Windows
├── run.ps1                # Script PowerShell untuk menjalankan server
├── README.md              # Dokumentasi lengkap proyek
└── public/                # File statis antarmuka web (Frontend)
    ├── index.html         # Halaman utama website pribadi
    ├── css/
    │   ├── style.css      # Gaya visual, tema dark/light, responsivitas
    │   └── animations.css # Animasi keyframes, pulse, dan micro-interactions
    └── js/
        ├── api.js         # Klien REST API untuk komunikasi dengan server & database
        ├── app.js         # Logika interaktif, rendering data dinamis, filter
        └── admin.js       # Panel CMS / admin untuk mengelola isi database
```

---

## ⚡ Cara Menjalankan

### Cara 1: Menggunakan File Batch (Paling Praktis)
Cukup klik dua kali file **`run.bat`**. 
Script akan otomatis:
1. Memeriksa keberadaan Python.
2. Menginisialisasi file `database.db`.
3. Membuka browser Anda ke alamat `http://localhost:8000`.
4. Menjalankan server web.

---

### Cara 2: Menjalankan via Terminal / PowerShell
Buka terminal di folder proyek (`d:\PROJECT WEB SERVER\aldomogolweb`), lalu jalankan:

```powershell
# 1. Inisialisasi basis data SQLite
& "C:\Users\ALDO MOGOL\AppData\Local\Python\pythoncore-3.15-64\python.exe" init_db.py

# 2. Jalankan server
& "C:\Users\ALDO MOGOL\AppData\Local\Python\pythoncore-3.15-64\python.exe" server.py
```

Buka peramban (browser) Anda dan kunjungi:
👉 **`http://localhost:8000`**

---

## 🛠️ Endpoint REST API Tersedia

| Metode | URL | Keterangan |
|---|---|---|
| `GET` | `/api/health` | Cek status kesehatan server dan koneksi database SQLite |
| `GET` | `/api/profile` | Mendapatkan data profil dan bio |
| `PUT` | `/api/profile` | Memperbarui informasi profil di database |
| `GET` | `/api/skills` | Mengambil seluruh daftar keahlian |
| `POST` | `/api/skills` | Menambahkan keahlian baru ke database |
| `DELETE` | `/api/skills/{id}` | Menghapus keahlian dari database |
| `GET` | `/api/projects` | Mengambil seluruh portofolio proyek |
| `POST` | `/api/projects` | Menambahkan proyek baru ke database |
| `DELETE` | `/api/projects/{id}` | Menghapus proyek dari database |
| `GET` | `/api/experiences` | Mengambil timeline pengalaman & pendidikan |
| `GET` | `/api/messages` | Mengambil daftar pesan buku tamu |
| `POST` | `/api/messages` | Mengirim pesan baru ke database (dari form kontak) |
| `DELETE` | `/api/messages/{id}` | Menghapus pesan dari database |
| `GET` | `/api/stats` | Mengambil rekap jumlah proyek, skill, dan pesan |

---

## 🔐 Akses Panel Admin
- Klik tombol **"Admin DB"** di navbar atau tombol **"Kelola Database"** di bagian hero.
- Masukkan PIN: **`1234`**.
- Anda dapat mengelola seluruh konten database langsung secara visual melalui antarmuka web.

