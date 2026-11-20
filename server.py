"""
server.py - Server Web & REST API Backend untuk Website Pribadi Aldo Mogol
Dibuat dengan modul standar Python (http.server + sqlite3) tanpa perlu dependensi eksternal.
Mendukung:
- Penyajian file statis (HTML, CSS, JavaScript, gambar)
- REST API endpoint untuk Profil, Keahlian, Proyek, Pengalaman, dan Pesan (Database SQLite)
- Multi-threading untuk performa responsif
"""

import os
import sys
import json
import sqlite3
import mimetypes
from urllib.parse import urlparse, parse_qs
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

# Konfigurasi Direktori & Database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
DB_PATH = os.path.join(BASE_DIR, "database.db")
PORT = 8000

# Pastikan tipe MIME terdaftar dengan benar
mimetypes.init()
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/json", ".json")

def get_db_connection():
    """Membuka koneksi ke SQLite database dengan row_factory dictionary."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def ensure_database():
    """Pastikan database sudah diinisialisasi."""
    if not os.path.exists(DB_PATH):
        print("[*] Database belum ditemukan. Menjalankan inisialisasi awal...")
        try:
            import init_db
            init_db.init_database()
        except Exception as e:
            print(f"[!] Gagal inisialisasi database: {e}")

class PersonalWebHandler(BaseHTTPRequestHandler):
    """Handler HTTP untuk menyajikan API dan file statis."""

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.end_headers()

    def do_OPTIONS(self):
        """Menangani pre-flight CORS."""
        self._set_headers(204)

    def _read_json_body(self):
        """Membaca dan mem-parsing body JSON dari request."""
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                return {}
            raw_data = self.rfile.read(content_length).decode("utf-8")
            return json.loads(raw_data)
        except Exception:
            return {}

    def _send_json(self, data, status=200):
        """Mengirim respons JSON ke client."""
        self._set_headers(status, "application/json; charset=utf-8")
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    # ==========================================
    # GET REQUESTS
    # ==========================================
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Routing API
        if path.startswith("/api/"):
            self._handle_api_get(path, parsed)
            return

        # Penyajian File Statis
        self._serve_static(path)

    def _handle_api_get(self, path, parsed):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Status Health Check
            if path == "/api/health":
                cursor.execute("SELECT sqlite_version()")
                sqlite_ver = cursor.fetchone()[0]
                self._send_json({
                    "status": "online",
                    "database": "connected",
                    "sqlite_version": sqlite_ver,
                    "server": "Aldo Mogol Personal Server 1.0"
                })

            # Data Profil
            elif path == "/api/profile":
                cursor.execute("SELECT * FROM profile WHERE id = 1")
                row = cursor.fetchone()
                if row:
                    self._send_json(dict(row))
                else:
                    self._send_json({"error": "Profil belum ditemukan"}, 404)

            # Daftar Keahlian (Skills)
            elif path == "/api/skills":
                cursor.execute("SELECT * FROM skills ORDER BY category, level DESC")
                rows = [dict(r) for r in cursor.fetchall()]
                self._send_json(rows)

            # Daftar Proyek
            elif path == "/api/projects":
                cursor.execute("SELECT * FROM projects ORDER BY featured DESC, id DESC")
                rows = [dict(r) for r in cursor.fetchall()]
                self._send_json(rows)

            # Riwayat Pengalaman & Pendidikan
            elif path == "/api/experiences":
                cursor.execute("SELECT * FROM experiences ORDER BY id ASC")
                rows = [dict(r) for r in cursor.fetchall()]
                self._send_json(rows)

            # Pesan Masuk / Buku Tamu
            elif path == "/api/messages":
                cursor.execute("SELECT id, name, email, subject, message, created_at, is_read FROM messages ORDER BY id DESC")
                rows = [dict(r) for r in cursor.fetchall()]
                self._send_json(rows)

            # Statistik Ringkas
            elif path == "/api/stats":
                cursor.execute("SELECT COUNT(*) FROM projects")
                proj_count = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM skills")
                skill_count = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM messages")
                msg_count = cursor.fetchone()[0]
                self._send_json({
                    "projects_count": proj_count,
                    "skills_count": skill_count,
                    "messages_count": msg_count,
                    "experience_years": "2+"
                })

            else:
                self._send_json({"error": "Endpoint tidak ditemukan"}, 404)

            conn.close()
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    # ==========================================
    # POST REQUESTS (TAMBAH DATA KE DATABASE)
    # ==========================================
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if not path.startswith("/api/"):
            self._send_json({"error": "Metode tidak diizinkan"}, 405)
            return

        body = self._read_json_body()
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Tambah Pesan Masuk (Buku Tamu / Kontak)
            if path == "/api/messages":
                name = body.get("name", "").strip()
                email = body.get("email", "").strip()
                subject = body.get("subject", "Pesan dari Website").strip()
                message = body.get("message", "").strip()

                if not name or not email or not message:
                    self._send_json({"error": "Nama, email, dan pesan wajib diisi!"}, 400)
                    conn.close()
                    return

                cursor.execute("""
                    INSERT INTO messages (name, email, subject, message)
                    VALUES (?, ?, ?, ?)
                """, (name, email, subject, message))
                conn.commit()
                msg_id = cursor.lastrowid
                conn.close()
                self._send_json({
                    "success": True,
                    "message": "Pesan Anda berhasil disimpan di database!",
                    "id": msg_id
                }, 201)

            # Tambah Proyek Baru (Admin)
            elif path == "/api/projects":
                title = body.get("title", "").strip()
                category = body.get("category", "Web App").strip()
                description = body.get("description", "").strip()
                tags = body.get("tags", "").strip()
                demo_url = body.get("demo_url", "#").strip()
                github_url = body.get("github_url", "#").strip()
                featured = 1 if body.get("featured") else 0

                if not title or not description:
                    self._send_json({"error": "Judul dan deskripsi proyek wajib diisi!"}, 400)
                    conn.close()
                    return

                cursor.execute("""
                    INSERT INTO projects (title, category, description, tags, demo_url, github_url, image_url, featured)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (title, category, description, tags, demo_url, github_url, "custom", featured))
                conn.commit()
                proj_id = cursor.lastrowid
                conn.close()
                self._send_json({
                    "success": True,
                    "message": "Proyek berhasil ditambahkan ke database!",
                    "id": proj_id
                }, 201)

            # Tambah Keahlian Baru (Admin)
            elif path == "/api/skills":
                name = body.get("name", "").strip()
                category = body.get("category", "Frontend").strip()
                level = int(body.get("level", 80))
                icon = body.get("icon", "code").strip()

                if not name:
                    self._send_json({"error": "Nama skill wajib diisi!"}, 400)
                    conn.close()
                    return

                cursor.execute("""
                    INSERT INTO skills (name, category, level, icon)
                    VALUES (?, ?, ?, ?)
                """, (name, category, level, icon))
                conn.commit()
                skill_id = cursor.lastrowid
                conn.close()
                self._send_json({
                    "success": True,
                    "message": "Skill berhasil ditambahkan ke database!",
                    "id": skill_id
                }, 201)

            else:
                self._send_json({"error": "Endpoint POST tidak ditemukan"}, 404)
                conn.close()

        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    # ==========================================
    # PUT REQUESTS (UPDATE DATA)
    # ==========================================
    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/profile":
            body = self._read_json_body()
            try:
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE profile SET
                        name = COALESCE(?, name),
                        title = COALESCE(?, title),
                        tagline = COALESCE(?, tagline),
                        bio = COALESCE(?, bio),
                        email = COALESCE(?, email),
                        phone = COALESCE(?, phone),
                        location = COALESCE(?, location),
                        available_for_hire = COALESCE(?, available_for_hire)
                    WHERE id = 1
                """, (
                    body.get("name"),
                    body.get("title"),
                    body.get("tagline"),
                    body.get("bio"),
                    body.get("email"),
                    body.get("phone"),
                    body.get("location"),
                    body.get("available_for_hire")
                ))
                conn.commit()
                conn.close()
                self._send_json({"success": True, "message": "Profil berhasil diperbarui di database!"})
            except Exception as e:
                self._send_json({"error": str(e)}, 500)
        else:
            self._send_json({"error": "Endpoint PUT tidak ditemukan"}, 404)

    # ==========================================
    # DELETE REQUESTS (HAPUS DATA DARI DATABASE)
    # ==========================================
    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Hapus pesan
            if path.startswith("/api/messages/"):
                msg_id = int(path.split("/")[-1])
                cursor.execute("DELETE FROM messages WHERE id = ?", (msg_id,))
                conn.commit()
                conn.close()
                self._send_json({"success": True, "message": f"Pesan #{msg_id} berhasil dihapus dari database."})

            # Hapus proyek
            elif path.startswith("/api/projects/"):
                proj_id = int(path.split("/")[-1])
                cursor.execute("DELETE FROM projects WHERE id = ?", (proj_id,))
                conn.commit()
                conn.close()
                self._send_json({"success": True, "message": f"Proyek #{proj_id} berhasil dihapus dari database."})

            # Hapus skill
            elif path.startswith("/api/skills/"):
                skill_id = int(path.split("/")[-1])
                cursor.execute("DELETE FROM skills WHERE id = ?", (skill_id,))
                conn.commit()
                conn.close()
                self._send_json({"success": True, "message": f"Skill #{skill_id} berhasil dihapus dari database."})

            else:
                self._send_json({"error": "Endpoint DELETE tidak valid"}, 404)
                conn.close()

        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    # ==========================================
    # SERVE STATIC FILES
    # ==========================================
    def _serve_static(self, path):
        if path == "/" or path == "":
            path = "/index.html"

        # Hilangkan query string dan amankan path traversal
        clean_path = path.lstrip("/").replace("\\", "/")
        target_path = os.path.normpath(os.path.join(PUBLIC_DIR, clean_path))

        # Keamanan: pastikan target_path tetap di dalam PUBLIC_DIR
        if not target_path.startswith(PUBLIC_DIR):
            self.send_error(403, "Akses dilarang")
            return

        if not os.path.exists(target_path) or os.path.isdir(target_path):
            # Jika file tidak ditemukan, coba cari index.html
            target_path = os.path.join(PUBLIC_DIR, "index.html")
            if not os.path.exists(target_path):
                self.send_error(404, "File tidak ditemukan")
                return

        # Dapatkan MIME type yang sesuai
        content_type, _ = mimetypes.guess_type(target_path)
        if not content_type:
            content_type = "application/octet-stream"

        try:
            with open(target_path, "rb") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "public, max-age=3600")
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Gagal membaca file: {e}")

    def log_message(self, format, *args):
        """Format log sederhana untuk terminal."""
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} {args[1]} -> {args[2]}\n")

def run_server():
    ensure_database()
    server_address = ("127.0.0.1", PORT)
    httpd = ThreadingHTTPServer(server_address, PersonalWebHandler)
    print("=" * 65)
    print(" 🚀 SERVER WEBSITE PRIBADI ALDO MOGOL BERJALAN DENGAN SUKSES! ")
    print("=" * 65)
    print(f" [+] URL Website : http://localhost:{PORT}")
    print(f" [+] REST API    : http://localhost:{PORT}/api/profile")
    print(f" [+] Basis Data  : SQLite ({DB_PATH})")
    print("=" * 65)
    print(" Tekan Ctrl+C untuk menghentikan server.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Mematikan server secara aman...")
        httpd.server_close()
        print("[✓] Server telah dinonaktifkan.")

if __name__ == "__main__":
    run_server()

