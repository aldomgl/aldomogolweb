"""
init_db.py - Script Inisialisasi Basis Data SQLite untuk Website Pribadi Aldo Mogol
Menyiapkan tabel dan data awal (seeding) untuk profil, keahlian, proyek, pengalaman, dan pesan.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.db")

def init_database():
    print(f"[*] Menginisialisasi basis data di: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Tabel Profil
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            tagline TEXT,
            bio TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            location TEXT,
            github TEXT,
            linkedin TEXT,
            instagram TEXT,
            available_for_hire INTEGER DEFAULT 1,
            avatar_url TEXT
        )
    """)

    # 2. Tabel Keahlian (Skills)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            level INTEGER NOT NULL,
            icon TEXT
        )
    """)

    # 3. Tabel Proyek (Projects)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            tags TEXT NOT NULL,
            demo_url TEXT,
            github_url TEXT,
            image_url TEXT,
            featured INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 4. Tabel Pengalaman & Pendidikan (Experiences)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS experiences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            organization TEXT NOT NULL,
            period TEXT NOT NULL,
            description TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'work'
        )
    """)

    # 5. Tabel Pesan Kontak & Buku Tamu (Messages)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_read INTEGER DEFAULT 0
        )
    """)

    # Cek apakah data profil sudah ada, jika belum lakukan seeding
    cursor.execute("SELECT COUNT(*) FROM profile")
    if cursor.fetchone()[0] == 0:
        print("[+] Memasukkan data profil awal Aldo Mogol...")
        cursor.execute("""
            INSERT INTO profile (
                id, name, title, tagline, bio, email, phone, location, github, linkedin, instagram, available_for_hire, avatar_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            1,
            "Aldo Mogol",
            "Full-Stack Web Developer & Software Engineer",
            "Membangun Pengalaman Web Modern, Interaktif, dan Sistem Berbasis Data yang Andal",
            "Halo! Saya Aldo Mogol, seorang Software Developer yang bersemangat dalam merancang dan mengembangkan aplikasi web modern dari sisi antarmuka (Frontend) hingga arsitektur server dan basis data (Backend). Berpengalaman dalam HTML5, CSS3, JavaScript, REST API, serta manajemen basis data relasional. Selalu antusias mempelajari teknologi baru dan mengubah ide kompleks menjadi produk digital yang intuitif.",
            "aldomogol@example.com",
            "+62 812-3456-7890",
            "Indonesia",
            "https://github.com",
            "https://linkedin.com",
            "https://instagram.com",
            1,
            ""
        ))

    # Cek dan isi data skills awal
    cursor.execute("SELECT COUNT(*) FROM skills")
    if cursor.fetchone()[0] == 0:
        print("[+] Memasukkan daftar keahlian (skills)...")
        initial_skills = [
            ("HTML5 & Semantic Web", "Frontend", 95, "code"),
            ("CSS3, Flexbox & Grid", "Frontend", 92, "palette"),
            ("Modern JavaScript (ES6+)", "Frontend", 90, "terminal"),
            ("Responsive Web Design", "Frontend", 94, "smartphone"),
            ("Python Backend & REST API", "Backend", 88, "server"),
            ("SQLite & Relational Database", "Database", 88, "database"),
            ("Database Normalization & SQL Queries", "Database", 85, "layers"),
            ("API Architecture & Integration", "Backend", 86, "cpu"),
            ("Git & GitHub Version Control", "Tools", 89, "git-branch"),
            ("Web Performance & SEO", "Tools", 82, "zap"),
            ("UI/UX Design & Prototyping", "Design", 80, "layout"),
            ("Linux & Web Server Environment", "Tools", 78, "hard-drive")
        ]
        cursor.executemany("INSERT INTO skills (name, category, level, icon) VALUES (?, ?, ?, ?)", initial_skills)

    # Cek dan isi data proyek awal
    cursor.execute("SELECT COUNT(*) FROM projects")
    if cursor.fetchone()[0] == 0:
        print("[+] Memasukkan portofolio proyek awal...")
        initial_projects = [
            (
                "Sistem Web Toko & Inventaris Toko",
                "Web App",
                "Sistem web kasir dan manajemen stok barang berbasis relasional dengan pelacakan barang keluar-masuk otomatis, peringatan stok menipis, dan ringkasan penjualan harian.",
                "HTML5, CSS3, JavaScript, SQLite, Python",
                "#",
                "https://github.com",
                "inventory",
                1
            ),
            (
                "Platform Portofolio Pribadi & CMS Dinamis",
                "Web App",
                "Website profil pribadi interaktif terintegrasi REST API dan SQLite database. Dilengkapi panel admin untuk mengelola keahlian, proyek, serta membaca pesan masuk secara real-time.",
                "Vanilla JS, CSS Variables, REST API, SQLite3",
                "#",
                "https://github.com",
                "portfolio",
                1
            ),
            (
                "TaskFlow - Aplikasi Manajemen Tugas & Produktivitas",
                "Tools",
                "Aplikasi web kanban produktivitas dengan manajemen prioritas, filter kategori, batas waktu, dan sinkronisasi status tugas secara instan.",
                "JavaScript ES6+, CSS Grid, LocalStorage, SQLite",
                "#",
                "https://github.com",
                "taskflow",
                1
            ),
            (
                "Dashboard Pemantauan Server & Metrik IoT",
                "IoT / Tools",
                "Panel analitik visual interaktif untuk memonitor beban server, penggunaan memori, suhu perangkat, dan statistik request secara realtime dengan grafik interaktif.",
                "HTML5 Canvas, CSS Animations, JS Fetch, SQLite",
                "#",
                "https://github.com",
                "dashboard",
                0
            )
        ]
        cursor.executemany("""
            INSERT INTO projects (title, category, description, tags, demo_url, github_url, image_url, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_projects)

    # Cek dan isi data pengalaman & pendidikan awal
    cursor.execute("SELECT COUNT(*) FROM experiences")
    if cursor.fetchone()[0] == 0:
        print("[+] Memasukkan riwayat pengalaman dan pendidikan...")
        initial_exp = [
            (
                "Full-Stack Web Developer",
                "Freelance & Proyek Digital Mandiri",
                "2024 - Sekarang",
                "Mengembangkan solusi aplikasi web kustom untuk UMKM dan perorangan, mulai dari landing page responsif, dashboard administrasi, hingga sistem database relasional.",
                "work"
            ),
            (
                "Web & Frontend Developer",
                "Studio Desain & Kreatif Digital",
                "2023 - 2024",
                "Membangun antarmuka interaktif yang cepat, aksesibel, dan mobile-friendly dengan CSS modern, JavaScript vanilla, dan integrasi API.",
                "work"
            ),
            (
                "Sarjana Komputer (S.Kom) - Teknik Informatika",
                "Universitas Terkemuka",
                "2020 - 2024",
                "Mempelajari arsitektur sistem informasi, perancangan basis data relasional, rekayasa perangkat lunak, pemrograman web, dan keamanan siber.",
                "education"
            )
        ]
        cursor.executemany("""
            INSERT INTO experiences (role, organization, period, description, type)
            VALUES (?, ?, ?, ?, ?)
        """, initial_exp)

    # Cek dan isi pesan awal di buku tamu / kontak
    cursor.execute("SELECT COUNT(*) FROM messages")
    if cursor.fetchone()[0] == 0:
        print("[+] Memasukkan pesan sambutan awal...")
        initial_msgs = [
            (
                "Budi Pratama",
                "budi.pratama@example.com",
                "Tawaran Kerja Sama Proyek",
                "Halo Mas Aldo! Sangat menyukai desain portofolio dan integrasi databasenya yang rapi. Saya tertarik mendiskusikan pembuatan sistem internal untuk kantor kami.",
                1
            ),
            (
                "Rina Kartika",
                "rina.kartika@example.com",
                "Kesan Pengunjung",
                "Website pribadinya sangat interaktif, responsif, dan animasinya halus. Sukses selalu untuk karir web development-nya!",
                1
            )
        ]
        cursor.executemany("""
            INSERT INTO messages (name, email, subject, message, is_read)
            VALUES (?, ?, ?, ?, ?)
        """, initial_msgs)

    conn.commit()
    conn.close()
    print("[✓] Basis data SQLite 'database.db' berhasil disiapkan dengan data lengkap!")

if __name__ == "__main__":
    init_database()

