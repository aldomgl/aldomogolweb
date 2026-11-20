/**
 * app.js - Logika Interaktif Frontend Website Pribadi Aldo Mogol
 * Menangani animasi, rendering dinamis data dari database, filter, form kontak, dan tema
 */

document.addEventListener("DOMContentLoaded", async () => {
    // ==========================================
    // 1. PENGELOLAAN TEMA (DARK / LIGHT MODE)
    // ==========================================
    const htmlEl = document.documentElement;
    const themeToggleBtn = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    const savedTheme = localStorage.getItem("aldo_theme") || "dark";
    setTheme(savedTheme);

    function setTheme(theme) {
        htmlEl.setAttribute("data-theme", theme);
        localStorage.setItem("aldo_theme", theme);
        if (themeIcon) {
            themeIcon.textContent = theme === "dark" ? "🌙" : "☀️";
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = htmlEl.getAttribute("data-theme") || "dark";
            const nextTheme = currentTheme === "dark" ? "light" : "dark";
            setTheme(nextTheme);
        });
    }

    // ==========================================
    // 2. NAVIGASI MOBILE DRAWER & ACTIVE LINK
    // ==========================================
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileNavDrawer = document.getElementById("mobileNavDrawer");
    const mobileNavItems = document.querySelectorAll(".mobile-nav-item");

    if (mobileMenuBtn && mobileNavDrawer) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileNavDrawer.classList.toggle("open");
        });

        mobileNavItems.forEach(item => {
            item.addEventListener("click", () => {
                mobileNavDrawer.classList.remove("open");
            });
        });
    }

    // Highlight menu navigasi saat scroll
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-item");

    window.addEventListener("scroll", () => {
        let currentSectionId = "";
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });
    });

    // ==========================================
    // 3. ANIMASI TEKS KETIK (HERO TYPING EFFECT)
    // ==========================================
    const typingElement = document.getElementById("typingElement");
    const words = [
        "Full-Stack Web Developer",
        "Software Engineer",
        "Database Architecture Enthusiast",
        "Creative Problem Solver"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 90;
    const eraseSpeed = 45;
    const delayBetweenWords = 1800;

    function typeEffect() {
        if (!typingElement) return;
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typingElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let currentDelay = isDeleting ? eraseSpeed : typeSpeed;

        if (!isDeleting && charIndex === currentWord.length) {
            currentDelay = delayBetweenWords;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            currentDelay = 400;
        }

        setTimeout(typeEffect, currentDelay);
    }
    typeEffect();

    // ==========================================
    // 4. CEK KONEKSI DATABASE & SERVER
    // ==========================================
    const dbStatusBadge = document.getElementById("dbStatusBadge");
    const dbStatusText = document.getElementById("dbStatusText");
    const footerDbStatus = document.getElementById("footerDbStatus");

    async function checkDatabaseConnection() {
        const health = await window.API.checkHealth();
        if (health.online) {
            dbStatusBadge.classList.remove("offline");
            dbStatusText.textContent = "SQLite DB: Terkoneksi";
            if (footerDbStatus) {
                footerDbStatus.textContent = `Terkoneksi (SQLite3)`;
                footerDbStatus.className = "text-success";
            }
        } else {
            dbStatusBadge.classList.add("offline");
            dbStatusText.textContent = "Mode Offline / Standby";
            if (footerDbStatus) {
                footerDbStatus.textContent = "Standby (Offline Data Cache)";
                footerDbStatus.className = "text-muted";
            }
        }
    }
    await checkDatabaseConnection();

    // ==========================================
    // 5. RENDERING PROFIL & STATISTIK DARI DATABASE
    // ==========================================
    window.renderProfile = async function() {
        const profile = await window.API.getProfile();
        if (!profile) return;

        // Hero Section
        const heroName = document.getElementById("heroName");
        const heroTagline = document.getElementById("heroTagline");
        const heroAvailability = document.getElementById("heroAvailability");

        if (heroName) heroName.textContent = profile.name || "Aldo Mogol";
        if (heroTagline) heroTagline.textContent = profile.tagline || profile.bio;
        if (heroAvailability) {
            heroAvailability.textContent = profile.available_for_hire ? "Tersedia untuk Proyek & Kerja Sama" : "Sedang Menyelesaikan Proyek Utama";
        }

        // About Section
        const aboutBioText = document.getElementById("aboutBioText");
        const aboutLocation = document.getElementById("aboutLocation");
        const aboutEmail = document.getElementById("aboutEmail");
        const aboutPhone = document.getElementById("aboutPhone");
        const aboutWorkStatus = document.getElementById("aboutWorkStatus");

        if (aboutBioText) aboutBioText.textContent = profile.bio;
        if (aboutLocation) aboutLocation.textContent = profile.location || "Indonesia";
        if (aboutEmail) aboutEmail.textContent = profile.email || "aldomogol@example.com";
        if (aboutPhone) aboutPhone.textContent = profile.phone || "+62 812-3456-7890";
        if (aboutWorkStatus) {
            aboutWorkStatus.textContent = profile.available_for_hire ? "Tersedia untuk Proyek Baru" : "Sibuk";
            aboutWorkStatus.className = profile.available_for_hire ? "info-val text-success" : "info-val text-muted";
        }

        // Contact Section Card
        const contactCardEmail = document.getElementById("contactCardEmail");
        const contactCardLocation = document.getElementById("contactCardLocation");
        if (contactCardEmail) contactCardEmail.textContent = profile.email || "aldomogol@example.com";
        if (contactCardLocation) contactCardLocation.textContent = profile.location || "Indonesia";
    };

    window.updateStats = async function() {
        const stats = await window.API.getStats();
        const statProjects = document.getElementById("statProjects");
        const statSkills = document.getElementById("statSkills");
        const statMessages = document.getElementById("statMessages");

        if (statProjects) statProjects.textContent = `${stats.projects_count}+`;
        if (statSkills) statSkills.textContent = `${stats.skills_count}+`;
        if (statMessages) statMessages.textContent = `${stats.messages_count}`;
    };

    // ==========================================
    // 6. RENDERING KEAHLIAN (SKILLS) & FILTER
    // ==========================================
    let allSkills = [];
    window.renderSkills = async function(categoryFilter = "all") {
        const skillsContainer = document.getElementById("skillsContainer");
        if (!skillsContainer) return;

        allSkills = await window.API.getSkills();
        let filteredSkills = allSkills;

        if (categoryFilter !== "all") {
            filteredSkills = allSkills.filter(s => s.category.toLowerCase() === categoryFilter.toLowerCase());
        }

        if (filteredSkills.length === 0) {
            skillsContainer.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 2rem;">Belum ada keahlian untuk kategori ${categoryFilter}.</p>`;
            return;
        }

        skillsContainer.innerHTML = filteredSkills.map(skill => `
            <div class="skill-card animate-fade-in">
                <div class="skill-header">
                    <div class="skill-title-group">
                        <div class="skill-icon-wrap">
                            ${getSkillIconSvg(skill.icon || skill.category)}
                        </div>
                        <span class="skill-name">${escapeHTML(skill.name)}</span>
                    </div>
                    <span class="skill-percent">${skill.level}%</span>
                </div>
                <div class="skill-bar-bg">
                    <div class="skill-bar-fill" style="width: ${skill.level}%;"></div>
                </div>
                <span class="skill-category-badge">${escapeHTML(skill.category)}</span>
            </div>
        `).join("");
    };

    // Filter Buttons Listener untuk Keahlian
    const skillFilterBtns = document.querySelectorAll("#skillFilterTabs .filter-btn");
    skillFilterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            skillFilterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const cat = btn.getAttribute("data-category");
            window.renderSkills(cat);
        });
    });

    // ==========================================
    // 7. RENDERING PORTOFOLIO PROYEK & FILTER
    // ==========================================
    let allProjects = [];
    window.renderProjects = async function(categoryFilter = "all") {
        const projectsContainer = document.getElementById("projectsContainer");
        if (!projectsContainer) return;

        allProjects = await window.API.getProjects();
        let filteredProjects = allProjects;

        if (categoryFilter !== "all") {
            filteredProjects = allProjects.filter(p => p.category.toLowerCase().includes(categoryFilter.toLowerCase()));
        }

        if (filteredProjects.length === 0) {
            projectsContainer.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 2rem;">Belum ada proyek untuk filter ini.</p>`;
            return;
        }

        projectsContainer.innerHTML = filteredProjects.map(proj => {
            const tagsList = (proj.tags || "Web, Full-Stack").split(",").map(t => `<span class="tag-badge">${escapeHTML(t.trim())}</span>`).join("");
            const bannerIcon = getProjectBannerIcon(proj.category);

            return `
                <div class="project-card animate-fade-in" data-id="${proj.id}">
                    <div class="project-banner">
                        <span>${bannerIcon}</span>
                        ${proj.featured ? '<span class="project-featured-tag">Unggulan</span>' : ''}
                    </div>
                    <div class="project-body">
                        <span class="project-category">${escapeHTML(proj.category)}</span>
                        <h3 class="project-title">${escapeHTML(proj.title)}</h3>
                        <p class="project-desc">${escapeHTML(proj.description)}</p>
                        <div class="project-tags">${tagsList}</div>
                    </div>
                    <div class="project-footer">
                        <button class="btn btn-sm btn-outline view-proj-btn" data-id="${proj.id}">
                            Lihat Detail
                        </button>
                        <div style="display: flex; gap: 0.5rem;">
                            <a href="${proj.demo_url || '#'}" target="_blank" class="btn btn-sm btn-primary" title="Demo Aplikasi">
                                Demo
                            </a>
                            <a href="${proj.github_url || '#'}" target="_blank" class="btn btn-sm btn-secondary" title="Source Code">
                                Repo
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        // Event listener detail proyek
        document.querySelectorAll(".view-proj-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id"), 10);
                const proj = allProjects.find(p => p.id === id);
                if (proj) openProjectModal(proj);
            });
        });
    };

    // Filter Buttons Listener untuk Proyek
    const projectFilterBtns = document.querySelectorAll("#projectFilterTabs .filter-btn");
    projectFilterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            projectFilterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = btn.getAttribute("data-filter");
            window.renderProjects(filter);
        });
    });

    // ==========================================
    // 8. MODAL DETAIL PROYEK
    // ==========================================
    const projectDetailModal = document.getElementById("projectDetailModal");
    const closeProjModalBtn = document.getElementById("closeProjModalBtn");

    function openProjectModal(proj) {
        document.getElementById("modalProjTitle").textContent = proj.title;
        document.getElementById("modalProjCategory").textContent = proj.category;
        document.getElementById("modalProjDescription").textContent = proj.description;
        document.getElementById("modalProjBanner").querySelector("span").textContent = getProjectBannerIcon(proj.category);

        const tagsContainer = document.getElementById("modalProjTags");
        tagsContainer.innerHTML = (proj.tags || "").split(",").map(t => `<span class="tag-badge">${escapeHTML(t.trim())}</span>`).join("");

        const liveLink = document.getElementById("modalProjLiveLink");
        const repoLink = document.getElementById("modalProjRepoLink");
        liveLink.href = proj.demo_url || "#";
        repoLink.href = proj.github_url || "#";

        projectDetailModal.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    if (closeProjModalBtn) {
        closeProjModalBtn.addEventListener("click", () => {
            projectDetailModal.classList.remove("open");
            document.body.style.overflow = "";
        });
    }

    if (projectDetailModal) {
        projectDetailModal.addEventListener("click", (e) => {
            if (e.target === projectDetailModal) {
                projectDetailModal.classList.remove("open");
                document.body.style.overflow = "";
            }
        });
    }

    // ==========================================
    // 9. RENDERING PENGALAMAN & PENDIDIKAN TIMELINE
    // ==========================================
    async function renderTimeline() {
        const timelineContainer = document.getElementById("experienceTimeline");
        if (!timelineContainer) return;

        const experiences = await window.API.getExperiences();
        if (!experiences || experiences.length === 0) {
            timelineContainer.innerHTML = '<p class="text-muted">Belum ada riwayat pengalaman.</p>';
            return;
        }

        timelineContainer.innerHTML = experiences.map(exp => `
            <div class="timeline-item animate-fade-in">
                <div class="timeline-dot"></div>
                <div class="timeline-card glass-panel">
                    <span class="timeline-period">${escapeHTML(exp.period)}</span>
                    <h3 class="timeline-role">${escapeHTML(exp.role)}</h3>
                    <div class="timeline-org">${exp.type === 'education' ? '🎓' : '💼'} ${escapeHTML(exp.organization)}</div>
                    <p class="timeline-desc">${escapeHTML(exp.description)}</p>
                </div>
            </div>
        `).join("");
    }

    // ==========================================
    // 10. RENDERING BUKU TAMU / GUESTBOOK
    // ==========================================
    window.renderGuestbook = async function() {
        const guestbookList = document.getElementById("guestbookList");
        if (!guestbookList) return;

        const messages = await window.API.getMessages();
        if (!messages || messages.length === 0) {
            guestbookList.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 1.5rem;">Belum ada pesan di buku tamu. Jadilah yang pertama mengirimkan pesan melalui form di bawah!</p>';
            return;
        }

        // Tampilkan 6 pesan terbaru untuk tampilan buku tamu
        const displayMsgs = messages.slice(0, 6);
        guestbookList.innerHTML = displayMsgs.map(msg => {
            const initial = (msg.name || "A").charAt(0).toUpperCase();
            return `
                <div class="guestbook-card animate-fade-in">
                    <div class="guestbook-header">
                        <div class="guest-info">
                            <div class="guest-avatar">${initial}</div>
                            <div>
                                <h4 class="guest-name">${escapeHTML(msg.name)}</h4>
                                <span class="guest-date">${msg.created_at ? msg.created_at.split(' ')[0] : 'Baru'}</span>
                            </div>
                        </div>
                    </div>
                    <div style="font-size: 0.82rem; font-weight: 600; color: var(--primary); margin-bottom: 0.4rem;">
                        ${escapeHTML(msg.subject || 'Pesan Pengunjung')}
                    </div>
                    <p class="guestbook-msg">"${escapeHTML(msg.message)}"</p>
                </div>
            `;
        }).join("");
    };

    // ==========================================
    // 11. FORM KONTAK DENGAN PENYIMPANAN KE DATABASE
    // ==========================================
    const contactForm = document.getElementById("contactForm");
    const submitContactBtn = document.getElementById("submitContactBtn");
    const btnSubmitText = document.getElementById("btnSubmitText");
    const btnSubmitSpinner = document.getElementById("btnSubmitSpinner");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("senderName").value.trim();
            const email = document.getElementById("senderEmail").value.trim();
            const subject = document.getElementById("senderSubject").value.trim() || "Pesan dari Form Kontak";
            const message = document.getElementById("senderMessage").value.trim();

            if (!name || !email || !message) {
                window.showToast("Mohon lengkapi semua bidang isian wajib!", "error");
                return;
            }

            // Ubah status tombol loading
            submitContactBtn.disabled = true;
            btnSubmitText.textContent = "Menyimpan ke SQLite...";
            btnSubmitSpinner.style.display = "inline-block";

            try {
                const res = await window.API.sendMessage({ name, email, subject, message });

                if (res.success) {
                    window.showToast("Terima kasih! Pesan Anda telah berhasil disimpan di basis data.", "success");
                    contactForm.reset();
                    // Refresh buku tamu dan counter
                    window.renderGuestbook();
                    window.updateStats();
                } else {
                    window.showToast("Gagal mengirim pesan: " + (res.error || "Kesalahan server"), "error");
                }
            } catch (err) {
                window.showToast("Terjadi kesalahan koneksi saat mengirim pesan.", "error");
            } finally {
                submitContactBtn.disabled = false;
                btnSubmitText.textContent = "Kirim Pesan ke Database";
                btnSubmitSpinner.style.display = "none";
            }
        });
    }

    // ==========================================
    // 12. CETAK / UNDUH CV RESUME
    // ==========================================
    const printCvBtn = document.getElementById("printCvBtn");
    if (printCvBtn) {
        printCvBtn.addEventListener("click", () => {
            window.print();
        });
    }

    // ==========================================
    // 13. TOAST NOTIFICATION SYSTEM
    // ==========================================
    window.showToast = function(msg, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        const icon = type === "success" ? "✅" : (type === "error" ? "❌" : "ℹ️");
        toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(msg)}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(50px)";
            toast.style.transition = "all 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    function escapeHTML(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getProjectBannerIcon(category) {
        const cat = (category || "").toLowerCase();
        if (cat.includes("web")) return "🌐";
        if (cat.includes("iot")) return "📡";
        if (cat.includes("tool")) return "🛠️";
        if (cat.includes("mobile")) return "📱";
        return "💻";
    }

    function getSkillIconSvg(iconName) {
        const map = {
            code: "💻",
            palette: "🎨",
            terminal: "⚡",
            smartphone: "📱",
            server: "⚙️",
            database: "💾",
            layers: "🗄️",
            cpu: "🧠",
            "git-branch": "🌿",
            zap: "🚀",
            layout: "📐",
            "hard-drive": "🖥️"
        };
        return map[iconName] || "⭐";
    }

    // Inisialisasi awal seluruh komponen
    await window.renderProfile();
    await window.updateStats();
    await window.renderSkills();
    await window.renderProjects();
    await renderTimeline();
    await window.renderGuestbook();
});

