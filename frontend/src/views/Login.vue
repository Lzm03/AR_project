<template>
  <div class="login-page">
    <div class="shell">
      <!-- 登录卡片 -->
      <main class="card">
        <div class="card-title">Welcome back</div>
        <div class="card-sub">
          Log in to access your projects and 3D asset library.
        </div>

        <div class="field">
          <label>Email</label>
          <input
            class="input"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            v-model.trim="email"
          />
        </div>

        <div class="field">
          <label>Password</label>
          <input
            class="input"
            type="password"
            placeholder="Your password"
            autocomplete="current-password"
            v-model="password"
          />
        </div>

        <button
          class="primary-btn"
          :disabled="loading"
          @click="login"
        >
          {{ loading ? "Logging in…" : "Log in" }}
        </button>

        <div class="meta-row">
          <span>New to Chop Reality?</span>
          <a href="/signup" class="link">Create an account</a>
        </div>

        <div class="meta-row">
          <span>Changed your mind?</span>
          <a href="/" class="link">Back to Tomato Hero</a>
        </div>

        <div class="msg">{{ msg }}</div>
      </main>

      <!-- 右侧文案卡片 -->
      <aside class="side">
        <div class="side-tag">AR / VR WORKSPACE</div>
        <div class="side-title">Your space, synced.</div>
        <p class="side-text">
          Every account comes with a private library. Upload triggers,
          generate 3D models, and publish experiences without writing a
          single line of code.
        </p>
        <ul class="side-list">
          <li>
            <span class="side-dot"></span>
            <span>Keep all your AR trigger images in one place.</span>
          </li>
          <li>
            <span class="side-dot"></span>
            <span>Re-use 3D assets across multiple projects.</span>
          </li>
          <li>
            <span class="side-dot"></span>
            <span>Designed to feel as smooth as a native app.</span>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script>
import "./login.css";

export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      msg: "",
      loading: false,
      API_BASE: "http://localhost:3001",
    };
  },
  methods: {
    async login() {
      if (!this.email || !this.password) {
        this.msg = "Email and password are required.";
        return;
      }

      this.msg = "";
      this.loading = true;

      try {
        const res = await fetch(`${this.API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        if (res.ok) {
          window.location.href = "/";
        } else {
          const data = await res.json().catch(() => ({}));
          this.msg = data.error || "Login failed.";
        }
      } catch (e) {
        this.msg = "Network error. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
