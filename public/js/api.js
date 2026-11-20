/**
 * api.js - Layanan Komunikasi REST API & Sinkronisasi Database SQLite
 * Website Pribadi Aldo Mogol
 */

const API_BASE = window.location.origin.startsWith("http")
    ? window.location.origin + "/api"
    : "http://localhost:8000/api";

const API = {
    isServerOnline: false,

    // Fallback data lokal jika server belum dijalankan (agar preview tetap indah)
    fallbackData: {
        profile: {
            name: "Aldo Mogol",
            title: "Full-Stack Web Developer & Software Engineer",
            tagline: "Membangun Pengalaman Web Modern, Interaktif, dan Sistem Berbasis Data yang Andal",
            bio: "Halo! Saya Aldo Mogol, seorang Software Developer yang berfokus pada pembuatan aplikasi web modern, responsif, berkinerja tinggi, dan arsitektur basis data relasional. Berpengalaman dengan HTML5, CSS3, JavaScript ES6+, Python, dan SQLite.",
            email: "aldomogol@example.com",
            phone: "+62 812-3456-7890",
            location: "Indonesia",
            github: "https://github.com",
            linkedin: "https://linkedin.com",
            available_for_hire: 1
        },
        skills: [
            { id: 1, name: "HTML5 & Semantic Web", category: "Frontend", level: 95, icon: "code" },
            { id: 2, name: "CSS3, Flexbox & Grid", category: "Frontend", level: 92, icon: "palette" },
            { id: 3, name: "Modern JavaScript (ES6+)", category: "Frontend", level: 90, icon: "terminal" },
            { id: 4, name: "Responsive Web Design", category: "Frontend", level: 94, icon: "smartphone" },
            { id: 5, name: "Python Backend & REST API", category: "Backend", level: 88, icon: "server" },
            { id: 6, name: "SQLite & Relational Database", category: "Database", level: 88, icon: "database" },
            { id: 7, name: "Database Normalization & SQL Queries", category: "Database", level: 85, icon: "layers" },
            { id: 8, name: "Git & Version Control", category: "Tools", level: 89, icon: "git-branch" }
        ],
        projects: [
            {
                id: 1,
                title: "Sistem Web Toko & Inventaris Toko",
                category: "Web App",
                description: "Sistem web kasir dan manajemen stok barang relasional dengan pelacakan stok otomatis dan laporan analitik.",
                tags: "HTML5, CSS3, JavaScript, SQLite, Python",
                demo_url: "#",
                github_url: "https://github.com",
                featured: 1
            },
            {
                id: 2,
                title: "Platform Portofolio Pribadi & CMS Dinamis",
                category: "Web App",
                description: "Website profil pribadi modern terintegrasi REST API dan SQLite database. Dilengkapi panel admin CMS langsung.",
                tags: "Vanilla JS, CSS Variables, REST API, SQLite3",
                demo_url: "#",
                github_url: "https://github.com",
                featured: 1
            },
            {
                id: 3,
                title: "TaskFlow - Aplikasi Manajemen Tugas",
                category: "Tools",
                description: "Aplikasi produktivitas kanban dengan manajemen prioritas, filter kategori, dan penyimpanan basis data lokal.",
                tags: "JavaScript ES6+, CSS Grid, SQLite",
                demo_url: "#",
                github_url: "https://github.com",
                featured: 1
            }
        ],
        experiences: [
            {
                id: 1,
                role: "Full-Stack Web Developer",
                organization: "Freelance & Proyek Digital Mandiri",
                period: "2024 - Sekarang",
                description: "Mengembangkan solusi aplikasi web kustom untuk klien, mulai dari landing page interaktif hingga sistem database relasional.",
                type: "work"
            },
            {
                id: 2,
                role: "Web & Frontend Developer",
                organization: "Studio Desain & Kreatif Digital",
                period: "2023 - 2024",
                description: "Membangun antarmuka interaktif yang cepat, aksesibel, dan mobile-friendly dengan CSS modern dan JavaScript.",
                type: "work"
            },
            {
                id: 3,
                role: "Sarjana Komputer (S.Kom) - Teknik Informatika",
                organization: "Universitas Terkemuka",
                period: "2020 - 2024",
                description: "Fokus pada rekayasa perangkat lunak, perancangan basis data relasional, algoritma komputasi, dan pengembangan web.",
                type: "education"
            }
        ],
        messages: [
            {
                id: 1,
                name: "Budi Pratama",
                email: "budi.pratama@example.com",
                subject: "Tawaran Kerja Sama Proyek",
                message: "Halo Mas Aldo! Sangat menyukai desain portofolio dan integrasi databasenya yang rapi.",
                created_at: "2026-11-18 10:30:00"
            },
            {
                id: 2,
                name: "Rina Kartika",
                email: "rina.kartika@example.com",
                subject: "Kesan Pengunjung",
                message: "Website pribadinya sangat interaktif, responsif, dan animasinya halus. Sukses selalu!",
                created_at: "2026-11-19 14:15:00"
            }
        ]
    },

    /**
     * Memeriksa apakah server backend dan database SQLite sedang berjalan
     */
    async checkHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                this.isServerOnline = true;
                return { online: true, details: data };
            }
        } catch (e) {
            this.isServerOnline = false;
        }
        return { online: false };
    },

    /**
     * Mengambil data profil dari database
     */
    async getProfile() {
        if (!this.isServerOnline) return this.fallbackData.profile;
        try {
            const res = await fetch(`${API_BASE}/profile`);
            if (res.ok) return await res.json();
        } catch (e) {
            console.warn("Gagal fetch profile dari API, menggunakan fallback:", e);
        }
        return this.fallbackData.profile;
    },

    /**
     * Memperbarui data profil di database
     */
    async updateProfile(profileData) {
        if (!this.isServerOnline) {
            Object.assign(this.fallbackData.profile, profileData);
            return { success: true, message: "Profil diperbarui (mode lokal)" };
        }
        const res = await fetch(`${API_BASE}/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData)
        });
        return await res.json();
    },

    /**
     * Mengambil daftar skills dari database
     */
    async getSkills() {
        if (!this.isServerOnline) return this.fallbackData.skills;
        try {
            const res = await fetch(`${API_BASE}/skills`);
            if (res.ok) return await res.json();
        } catch (e) {
            console.warn("Gagal fetch skills dari API:", e);
        }
        return this.fallbackData.skills;
    },

    /**
     * Menambahkan keahlian baru ke database
     */
    async addSkill(skillData) {
        if (!this.isServerOnline) {
            const newSkill = { id: Date.now(), ...skillData };
            this.fallbackData.skills.push(newSkill);
            return { success: true, message: "Skill ditambahkan (mode lokal)", id: newSkill.id };
        }
        const res = await fetch(`${API_BASE}/skills`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(skillData)
        });
        return await res.json();
    },

    /**
     * Menghapus keahlian dari database
     */
    async deleteSkill(id) {
        if (!this.isServerOnline) {
            this.fallbackData.skills = this.fallbackData.skills.filter(s => s.id !== id);
            return { success: true };
        }
        const res = await fetch(`${API_BASE}/skills/${id}`, { method: "DELETE" });
        return await res.json();
    },

    /**
     * Mengambil daftar proyek dari database
     */
    async getProjects() {
        if (!this.isServerOnline) return this.fallbackData.projects;
        try {
            const res = await fetch(`${API_BASE}/projects`);
            if (res.ok) return await res.json();
        } catch (e) {
            console.warn("Gagal fetch projects dari API:", e);
        }
        return this.fallbackData.projects;
    },

    /**
     * Menambahkan proyek baru ke database
     */
    async addProject(projectData) {
        if (!this.isServerOnline) {
            const newProj = { id: Date.now(), ...projectData };
            this.fallbackData.projects.unshift(newProj);
            return { success: true, message: "Proyek ditambahkan (mode lokal)", id: newProj.id };
        }
        const res = await fetch(`${API_BASE}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(projectData)
        });
        return await res.json();
    },

    /**
     * Menghapus proyek dari database
     */
    async deleteProject(id) {
        if (!this.isServerOnline) {
            this.fallbackData.projects = this.fallbackData.projects.filter(p => p.id !== id);
            return { success: true };
        }
        const res = await fetch(`${API_BASE}/projects/${id}`, { method: "DELETE" });
        return await res.json();
    },

    /**
     * Mengambil riwayat pengalaman & pendidikan
     */
    async getExperiences() {
        if (!this.isServerOnline) return this.fallbackData.experiences;
        try {
            const res = await fetch(`${API_BASE}/experiences`);
            if (res.ok) return await res.json();
        } catch (e) {
            console.warn("Gagal fetch experiences dari API:", e);
        }
        return this.fallbackData.experiences;
    },

    /**
     * Mengambil pesan kontak / buku tamu dari database
     */
    async getMessages() {
        if (!this.isServerOnline) return this.fallbackData.messages;
        try {
            const res = await fetch(`${API_BASE}/messages`);
            if (res.ok) return await res.json();
        } catch (e) {
            console.warn("Gagal fetch messages dari API:", e);
        }
        return this.fallbackData.messages;
    },

    /**
     * Mengirim pesan baru ke database (dari form kontak)
     */
    async sendMessage(msgData) {
        if (!this.isServerOnline) {
            const newMsg = {
                id: Date.now(),
                name: msgData.name,
                email: msgData.email,
                subject: msgData.subject || "Pesan dari Form Kontak",
                message: msgData.message,
                created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
            };
            this.fallbackData.messages.unshift(newMsg);
            return { success: true, message: "Pesan tersimpan (mode lokal)", id: newMsg.id };
        }
        const res = await fetch(`${API_BASE}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(msgData)
        });
        return await res.json();
    },

    /**
     * Menghapus pesan dari database
     */
    async deleteMessage(id) {
        if (!this.isServerOnline) {
            this.fallbackData.messages = this.fallbackData.messages.filter(m => m.id !== id);
            return { success: true };
        }
        const res = await fetch(`${API_BASE}/messages/${id}`, { method: "DELETE" });
        return await res.json();
    },

    /**
     * Mengambil statistik ringkas dari database
     */
    async getStats() {
        if (!this.isServerOnline) {
            return {
                projects_count: this.fallbackData.projects.length,
                skills_count: this.fallbackData.skills.length,
                messages_count: this.fallbackData.messages.length,
                experience_years: "2+"
            };
        }
        try {
            const res = await fetch(`${API_BASE}/stats`);
            if (res.ok) return await res.json();
        } catch (e) {
            console.warn("Gagal fetch stats dari API:", e);
        }
        return { projects_count: 4, skills_count: 12, messages_count: 2, experience_years: "2+" };
    }
};

window.API = API;

