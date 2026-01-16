<template>
  <div class="signup-page">
    <div class="shell">
      <!-- 左侧品牌介绍 -->
      <aside class="hero-panel">
        <div class="logo-tag">
          <span class="logo-dot"></span>
          <span>CHOP REALITY</span>
        </div>

        <div class="hero-title">Create once. Trigger anywhere.</div>
        <p class="hero-sub">
          Sign up to keep your AR triggers, 3D assets and projects in one
          place—always synced across devices.
        </p>

        <div class="hero-badge-row">
          <div class="hero-badge">Zero-code authoring</div>
          <div class="hero-badge">Per-user library</div>
          <div class="hero-badge">Designed for creators</div>
        </div>
      </aside>

      <!-- 右侧注册卡片 -->
      <main class="card">
        <header class="card-header">
          <div class="card-title">Create your account</div>
          <div class="card-sub">
            Use your email to receive a one-time verification code.
          </div>
        </header>

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
          <label>Verification code</label>
          <div class="code-row">
            <input
              class="input"
              placeholder="6-digit code"
              v-model.trim="code"
            />
            <button
              class="chip-btn"
              type="button"
              :disabled="sending"
              @click="sendCode"
            >
              {{ sending ? "Sending…" : "Send code" }}
            </button>
          </div>
        </div>

        <div class="field">
          <label>Password</label>
          <input
            class="input"
            type="password"
            placeholder="At least 6 characters"
            autocomplete="new-password"
            v-model="password"
          />
        </div>

        <button
          class="primary-btn"
          :disabled="loading"
          @click="signup"
        >
          {{ loading ? "Creating…" : "Create account" }}
        </button>

        <div class="meta-row">
          <span>Already a member?</span>
          <a href="/login" class="link">Log in</a>
        </div>

        <div class="meta-row">
          <span>Just exploring?</span>
          <a href="/" class="link">Back to Tomato Hero</a>
        </div>

        <div
          class="msg"
          :class="{ error: msgType === 'error', ok: msgType === 'ok' }"
        >
          {{ msg }}
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import "./signup.css";

const API_BASE = import.meta.env.DEV
  ? "http://localhost:3001"
  : import.meta.env.VITE_API_BASE;

export default {
  name: "Signup",
  data() {
    return {
      email: "",
      password: "",
      code: "",
      msg: "",
      msgType: "",
      sending: false,
      loading: false,
      API_BASE: API_BASE,
    };
  },
  methods: {
    setMsg(text, type = "") {
      this.msg = text || "";
      this.msgType = type;
    },

    async sendCode() {
      if (!this.email) {
        this.setMsg("Please enter your email first.", "error");
        return;
      }

      this.setMsg("");
      this.sending = true;

      try {
        const res = await fetch(`${this.API_BASE}/api/auth/send-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email }),
        });

        if (!res.ok) {
          this.setMsg("Failed to send code. Please try again.", "error");
        } else {
          this.setMsg(
            "Verification code sent. Check server console in dev.",
            "ok"
          );
        }
      } catch (e) {
        this.setMsg("Network error. Please try again.", "error");
      } finally {
        this.sending = false;
      }
    },

    async signup() {
      if (!this.email || !this.password || !this.code) {
        this.setMsg(
          "Email, verification code and password are required.",
          "error"
        );
        return;
      }

      this.setMsg("");
      this.loading = true;

      try {
        const res = await fetch(`${this.API_BASE}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: this.email,
            password: this.password,
            code: this.code,
          }),
        });

        if (res.ok) {
          this.setMsg("Account created. Redirecting…", "ok");
          setTimeout(() => {
            window.location.href = "/";
          }, 700);
        } else {
          const data = await res.json().catch(() => ({}));
          this.setMsg(data.error || "Sign up failed.", "error");
        }
      } catch (e) {
        this.setMsg("Network error. Please try again.", "error");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
