<template>
  <div class="library-shell">
    <!-- ===== Top Bar =====
    <header class="top-bar">
      <div class="top-left">
        <div class="logo-dot"></div>
        <div>
          <div class="top-title">CHOP REALITY</div>
          <div class="top-sub">Personal AR Library</div>
        </div>
      </div>

      <div class="top-right">
        <div class="chip">{{ userEmail }}</div>
        <button class="link-btn" @click="goHome">← Back</button>
        <button class="link-btn accent" @click="logout">Logout</button>
      </div>
    </header> -->

    <!-- ===== Main Card ===== -->
    <main class="main-card">
      <!-- Header -->
      <div class="main-header">
        <div>
          <div class="main-title">我的角色</div>
          <div class="main-sub">
            您所建立或上傳的一切內容都將顯示於此處
          </div>

          <div class="pill-row">
            <div class="pill">AI 角色</div>
            <div class="pill">3D 模型</div>
            <div class="pill">項目</div>
          </div>
        </div>

        <button class="link-btn create-btn" @click="goCreate">
          立即創建
        </button>
      </div>

      <!-- ===== Content ===== -->
      <section class="library-content">
        <!-- Empty -->
        <div v-if="!projects.length" class="empty-state">
          目前尚無角色。  
           建立角色後，它將出現在此處。
        </div>

        <!-- Grid -->
        <div v-else class="project-grid">
          <div
            v-for="p in projects"
            :key="p.id"
            class="project-card"
            @click="openProject(p)"
          >
            <!-- ⭐ 3D Preview -->
            <div class="card-preview">
              <model-viewer
                v-if="p.model"
                :src="p.model"
                autoplay
                interaction-prompt="none"
                environment-image="neutral"
                exposure="1"
                disable-zoom
                disable-pan
                disable-tap
              />
            </div>

            <div class="card-header">
              <div class="card-title">{{ p.name }}</div>
              <div class="card-tag">AI Character</div>
            </div>

            <div class="card-meta">
              <span>Created</span>
              <span>{{ p.createdAt }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      Library data is scoped to your account.
    </footer>
  </div>
</template>

<script>
import "./library.css";

const API_BASE = import.meta.env.DEV
  ? "http://localhost:3001"
  : import.meta.env.VITE_API_BASE;

export default {
  name: "Library",

  data() {
    return {
      API_BASE: API_BASE,
      userEmail: "Loading…",
      projects: [],
    };
  },

  mounted() {
    this.fetchMe();
    this.loadLibrary();
  },

  methods: {
    goCreate() {
      location.href = "/create";
    },

    async fetchMe() {
      const res = await fetch(`${this.API_BASE}/api/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        location.href = "/login";
        return;
      }

      const data = await res.json();
      this.userEmail = data.email;
    },

    /**
     * 🔥 从 characters 加载 Library
     */
    async loadLibrary() {
      const res = await fetch(`${this.API_BASE}/api/library`, {
        credentials: "include",
      });
      if (!res.ok) return;

      const data = await res.json();

      this.projects = data.map(c => ({
        id: c.id,
        name: c.name || "Untitled Character",

        model: c.model?.idle
          ? (c.model.idle.startsWith("http")
              ? c.model.idle
              : this.API_BASE + c.model.idle)
          : null,

        createdAt: c.createdAt
          ? new Date(c.createdAt).toLocaleString()
          : "Just now",
      }));
    },

    logout() {
      fetch(`${this.API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      }).finally(() => {
        location.href = "/";
      });
    },

    /**
     * 点击卡片 → 进入 Chat
     */
    openProject(p) {
      location.href = `/chat/${p.id}`;
    },
  },
};
</script>
