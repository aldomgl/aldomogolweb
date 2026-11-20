/**
 * admin.js - Logika Panel Manajemen Database & CMS Website Pribadi Aldo Mogol
 */

document.addEventListener("DOMContentLoaded", () => {
    const adminModal = document.getElementById("adminModal");
    const openAdminBtn = document.getElementById("openAdminBtn");
    const heroAdminBtn = document.getElementById("heroAdminBtn");
    const closeAdminBtn = document.getElementById("closeAdminBtn");

    const adminPinBox = document.getElementById("adminPinBox");
    const adminPanelContent = document.getElementById("adminPanelContent");
    const adminPinInput = document.getElementById("adminPinInput");
    const verifyPinBtn = document.getElementById("verifyPinBtn");

    const adminTabBtns = document.querySelectorAll(".admin-tab-btn");
    const adminTabContents = document.querySelectorAll(".admin-tab-content");
    const adminMessagesContainer = document.getElementById("adminMessagesContainer");
    const refreshMessagesBtn = document.getElementById("refreshMessagesBtn");
    const adminMsgCount = document.getElementById("adminMsgCount");

    // Form Elemen
    const addProjectForm = document.getElementById("addProjectForm");
    const addSkillForm = document.getElementById("addSkillForm");
    const editProfileForm = document.getElementById("editProfileForm");

    // PIN Sederhana untuk Keamanan Akses
    const DEFAULT_PIN = "1234";

    function openModal() {
        adminModal.classList.add("open");
        adminModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        // Cek jika sudah unlock dalam session ini
        if (sessionStorage.getItem("admin_unlocked") === "true") {
            showAdminDashboard();
        } else {
            adminPinBox.style.display = "block";
            adminPanelContent.style.display = "none";
            adminPinInput.value = "";
            adminPinInput.focus();
        }
    }

    function closeModal() {
        adminModal.classList.remove("open");
        adminModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    if (openAdminBtn) openAdminBtn.addEventListener("click", openModal);
    if (heroAdminBtn) heroAdminBtn.addEventListener("click", openModal);
    if (closeAdminBtn) closeAdminBtn.addEventListener("click", closeModal);

    // Tutup jika klik di luar dialog
    adminModal.addEventListener("click", (e) => {
        if (e.target === adminModal) closeModal();
    });

    // Verifikasi PIN
    function handlePinVerification() {
        const pin = adminPinInput.value.trim();
        if (pin === DEFAULT_PIN || pin === "admin") {
            sessionStorage.setItem("admin_unlocked", "true");
            window.showToast("PIN Berhasil Terverifikasi! Selamat Datang di Panel Database.", "success");
            showAdminDashboard();
        } else {
            window.showToast("PIN Salah! Gunakan PIN default: 1234", "error");
            adminPinInput.select();
        }
    }

    if (verifyPinBtn) verifyPinBtn.addEventListener("click", handlePinVerification);
    if (adminPinInput) {
        adminPinInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handlePinVerification();
        });
    }

    function showAdminDashboard() {
        adminPinBox.style.display = "none";
        adminPanelContent.style.display = "block";
        loadAdminMessages();
        populateProfileForm();
    }

    // Navigasi Tab Admin
    adminTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            adminTabBtns.forEach(b => b.classList.remove("active"));
            adminTabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            const targetId = btn.getAttribute("data-tab");
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add("active");

            if (targetId === "inboxTab") loadAdminMessages();
            if (targetId === "editProfileTab") populateProfileForm();
        });
    });

    // ==========================================
    // TAB 1: KELOLA PESAN MASUK
    // ==========================================
    async function loadAdminMessages() {
        adminMessagesContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Mengambil data pesan dari SQLite...</p></div>';
        const messages = await window.API.getMessages();

        if (adminMsgCount) adminMsgCount.textContent = messages.length;

        if (!messages || messages.length === 0) {
            adminMessagesContainer.innerHTML = '<p class="text-muted" style="text-align: center; padding: 2rem;">Belum ada pesan yang tersimpan di dalam database.</p>';
            return;
        }

        adminMessagesContainer.innerHTML = messages.map(msg => `
            <div class="admin-msg-card" id="admin-msg-${msg.id}">
                <div class="admin-msg-header">
                    <div>
                        <strong>${escapeHTML(msg.name)}</strong>
                        <span class="text-muted" style="font-size: 0.8rem;"> &bull; ${escapeHTML(msg.email)}</span>
                    </div>
                    <div style="display: flex; gap: 0.4rem; align-items: center;">
                        <span class="text-muted" style="font-size: 0.75rem;">${msg.created_at || 'Baru'}</span>
                        <button class="btn btn-sm btn-outline text-danger delete-msg-btn" data-id="${msg.id}" title="Hapus pesan dari database">
                            🗑️ Hapus
                        </button>
                    </div>
                </div>
                <div style="font-size: 0.85rem; font-weight: 600; color: var(--primary);">
                    Subjek: ${escapeHTML(msg.subject || 'Pesan Website')}
                </div>
                <div class="admin-msg-body">
                    ${escapeHTML(msg.message)}
                </div>
            </div>
        `).join("");

        // Listener untuk tombol hapus pesan
        document.querySelectorAll(".delete-msg-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (confirm(`Apakah Anda yakin ingin menghapus pesan #${id} dari database SQLite?`)) {
                    btn.disabled = true;
                    btn.textContent = "Menghapus...";
                    const res = await window.API.deleteMessage(id);
                    if (res.success) {
                        window.showToast("Pesan berhasil dihapus dari database!", "success");
                        loadAdminMessages();
                        if (window.renderGuestbook) window.renderGuestbook();
                        if (window.updateStats) window.updateStats();
                    } else {
                        window.showToast("Gagal menghapus pesan: " + (res.error || "Kesalahan server"), "error");
                        btn.disabled = false;
                        btn.textContent = "🗑️ Hapus";
                    }
                }
            });
        });
    }

    if (refreshMessagesBtn) {
        refreshMessagesBtn.addEventListener("click", loadAdminMessages);
    }

    // ==========================================
    // TAB 2: TAMBAH PROYEK BARU KE DATABASE
    // ==========================================
    if (addProjectForm) {
        addProjectForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = document.getElementById("projTitle").value.trim();
            const category = document.getElementById("projCategory").value;
            const tags = document.getElementById("projTags").value.trim();
            const description = document.getElementById("projDesc").value.trim();
            const demo_url = document.getElementById("projDemoUrl").value.trim() || "#";
            const github_url = document.getElementById("projGithubUrl").value.trim() || "#";
            const featured = document.getElementById("projFeatured").checked ? 1 : 0;

            const submitBtn = addProjectForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.textContent = "Menyimpan ke SQLite...";

            const res = await window.API.addProject({
                title, category, tags, description, demo_url, github_url, featured
            });

            submitBtn.disabled = false;
            submitBtn.textContent = "Simpan Proyek ke Database";

            if (res.success) {
                window.showToast("Proyek berhasil ditambahkan ke database SQLite!", "success");
                addProjectForm.reset();
                if (window.renderProjects) window.renderProjects();
                if (window.updateStats) window.updateStats();
            } else {
                window.showToast("Gagal menyimpan proyek: " + (res.error || "Kesalahan"), "error");
            }
        });
    }

    // ==========================================
    // TAB 3: TAMBAH SKILL KE DATABASE
    // ==========================================
    if (addSkillForm) {
        addSkillForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("skillName").value.trim();
            const category = document.getElementById("skillCategory").value;
            const level = parseInt(document.getElementById("skillLevel").value, 10);

            const submitBtn = addSkillForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.textContent = "Menyimpan ke SQLite...";

            const res = await window.API.addSkill({
                name, category, level, icon: "code"
            });

            submitBtn.disabled = false;
            submitBtn.textContent = "Simpan Skill ke Database";

            if (res.success) {
                window.showToast("Skill berhasil ditambahkan ke database!", "success");
                addSkillForm.reset();
                if (window.renderSkills) window.renderSkills();
                if (window.updateStats) window.updateStats();
            } else {
                window.showToast("Gagal menambah skill: " + (res.error || "Kesalahan"), "error");
            }
        });
    }

    // ==========================================
    // TAB 4: EDIT INFORMASI PROFIL PRIBADI
    // ==========================================
    async function populateProfileForm() {
        const prof = await window.API.getProfile();
        if (prof) {
            document.getElementById("profName").value = prof.name || "";
            document.getElementById("profTitle").value = prof.title || "";
            document.getElementById("profTagline").value = prof.tagline || "";
            document.getElementById("profBio").value = prof.bio || "";
            document.getElementById("profEmail").value = prof.email || "";
            document.getElementById("profPhone").value = prof.phone || "";
            document.getElementById("profLocation").value = prof.location || "";
        }
    }

    if (editProfileForm) {
        editProfileForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("profName").value.trim();
            const title = document.getElementById("profTitle").value.trim();
            const tagline = document.getElementById("profTagline").value.trim();
            const bio = document.getElementById("profBio").value.trim();
            const email = document.getElementById("profEmail").value.trim();
            const phone = document.getElementById("profPhone").value.trim();
            const location = document.getElementById("profLocation").value.trim();

            const submitBtn = editProfileForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.textContent = "Memperbarui Database...";

            const res = await window.API.updateProfile({
                name, title, tagline, bio, email, phone, location
            });

            submitBtn.disabled = false;
            submitBtn.textContent = "Simpan Perubahan Profil ke Database";

            if (res.success) {
                window.showToast("Data profil di database SQLite berhasil diperbarui!", "success");
                if (window.renderProfile) window.renderProfile();
            } else {
                window.showToast("Gagal update profil: " + (res.error || "Kesalahan"), "error");
            }
        });
    }

    function escapeHTML(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});

