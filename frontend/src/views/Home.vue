<template>
  <!-- ===== 右上角登录状态 ===== -->
  <div class="top-auth">
    <template v-if="authLoading"></template>

    <template v-else-if="user">
      <span class="user-email">Hi, {{ user.email }}</span>
      <button @click="logout">登出</button>
      <button class="primary" @click="go('/library')">我的角色</button>
      <button class="primary" @click="go('/create')">創建角色</button>
    </template>

    <template v-else>
      <button class="primary" @click="goLogin">登錄</button>
    </template>
  </div>

  <!-- ===== 页面 Grid ===== -->
  <div class="home-shell">
    <div class="page-grid">

      <!-- ===== 第 1 格：Hero ===== -->
      <section class="section section-hero">
        <div class="hero-title">
          <div class="hero-text-block hero-left" style="text-align:right">
            <div class="hero-word">CHOP</div>
          </div>

          <div class="tomato-wrapper" ref="tomatoWrapper">
            <img
              class="tomato-frame"
              :src="tomatoFrameSrc"
              alt="Tomato hero"
            />

            <div class="tomato-overlay" ref="tomatoOverlay">
              <div class="tomato-lines">
                <div>Zero-Code AR/VR:</div>
                <div>Drag any photo.</div>
                <div>Get instant magic.</div>
              </div>
              <button class="tomato-upload-btn" @click.stop="triggerUpload">
                Upload any photo
              </button>
            </div>
          </div>

          <div class="hero-text-block hero-right" style="text-align:left">
            <div class="hero-word">REALITY</div>
            <div class="hero-word small-blue">Zero-Code AR/VR</div>
          </div>
        </div>
      </section>

      <!-- ===== 第 2 格：Intro ===== -->
      <section class="section section-intro">
        <p class="intro-text">
          ChopReality 是一個無需編程的 AI 藝術創作平台，
          讓師生在零基礎下也能輕鬆一站式創作不同 AI 創作，
          製作出用於教學或展示的互動作品。
        </p>
      </section>

      <!-- ===== 第 3 格：Characters ===== -->
      <section class="section section-characters">
        <h2 class="section-title">立即問名人問題</h2>

        <div class="character-grid">
          <!-- 孔子 -->
          <div
            class="character-card clickable-card"
            @click="goCharacter('confucius')"
          >
            <div class="character-avatar">孔子</div>
            <div class="character-quote">「如果同學欺負我，我該『以德報怨』嗎？」</div>
            <div class="character-quote">「你覺得現在的學生和古代的學生，誰的壓力更大？」</div>
            <div class="character-quote">「『學而時習之』為什麼會快樂？我考試前複習一點也不快樂。」</div>
          </div>

          <!-- 孙中山 -->
          <div
            class="character-card clickable-card"
            @click="goCharacter('sun-yat-sen')"
          >
            <div class="character-avatar">孫中山</div>
            <div class="character-quote">「你當時為什麼要革命？不害怕嗎？」</div>
            <div class="character-quote">「對於現在的香港青年，你有什麼寄語？」</div>
            <div class="character-quote">「你覺得怎樣才算是一個好的領袖？」</div>
          </div>

          <!-- 爱因斯坦 -->
          <div
            class="character-card clickable-card"
            @click="goCharacter('einstein')"
          >
            <div class="character-avatar">愛因斯坦</div>
            <div class="character-quote">「你覺得AI聰明，還是人腦聰明？」</div>
            <div class="character-quote">「你的相對論是怎麼想出來的？是做了很多實驗嗎？」</div>
            <div class="character-quote">「你考試也不及格過嗎？你怎麼面對失敗？」</div>
          </div>
        </div>
      </section>

      <!-- ===== 第 4 格：Interaction ===== -->
      <section class="section section-interaction">
        <h2 class="section-title">互動式對話體驗</h2>

        <div class="interaction-placeholder">
          上載你的文檔 / 測驗 / 筆記<br />
          一鍵生成互動式對話
        </div>
      </section>

      <!-- ===== 第 5 格：Spacer ===== -->
      <section class="section section-spacer"></section>

    </div>
  </div>

  <!-- ===== 隐藏文件选择 ===== -->
  <input
    ref="fileInput"
    type="file"
    accept="image/*"
    style="display:none"
    @change="onFileChange"
  />
</template>

<script>
import "./home.css";

const API_BASE = import.meta.env.DEV
  ? "http://localhost:3001"
  : import.meta.env.VITE_API_BASE;


export default {
  name: "Home",

  data() {
    return {
      API_BASE: API_BASE,
      user: null,
      authLoading: true,

      TOMATO_TOTAL_FRAMES: 64,
      TOMATO_SCALE_FROM: 1.0,
      TOMATO_SCALE_TO: 1.6,

      tomatoFrameIndex: 1,
      targetFrame: 1,
      timer: null,
      isHover: false,
    };
  },

  computed: {
    tomatoFrameSrc() {
      return `/frames/frame_${String(this.tomatoFrameIndex).padStart(3, "0")}.png`;
    },
  },

  mounted() {
    this.preloadFrames();
    this.updateMouthScale();
    window.addEventListener("resize", this.updateMouthScale);
    this.bindTomatoEvents();
    this.refreshAuth();
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateMouthScale);
    if (this.timer) clearInterval(this.timer);
  },

  methods: {
    /* ===== 路由 ===== */
    goLogin() {
      location.href = "/login";
    },
    go(path) {
      location.href = path;
    },
    goCharacter(id) {
      location.href = `/chat/${id}`;
    },

    /* ===== Auth ===== */
    async refreshAuth() {
      this.authLoading = true;
      try {
        const res = await fetch(`${this.API_BASE}/api/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw 0;
        this.user = await res.json();
      } catch {
        this.user = null;
      } finally {
        this.authLoading = false;
      }
    },

    async logout() {
      await fetch(`${this.API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      location.reload();
    },

    /* ===== Tomato 动画 ===== */
    preloadFrames() {
      for (let i = 1; i <= this.TOMATO_TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = `/frames/frame_${String(i).padStart(3, "0")}.png`;
      }
    },

    updateMouthScale() {
      const refWidth = 640;
      const w = this.$refs.tomatoWrapper?.offsetWidth || refWidth;
      const scale = Math.max(0.5, Math.min(1.1, w / refWidth));
      document.documentElement.style.setProperty("--mouth-scale", scale.toFixed(3));
    },

    updateFrame(i) {
      const progress = (i - 1) / (this.TOMATO_TOTAL_FRAMES - 1);
      const s =
        this.TOMATO_SCALE_FROM +
        (this.TOMATO_SCALE_TO - this.TOMATO_SCALE_FROM) * progress;

      this.$refs.tomatoWrapper
        .querySelector(".tomato-frame")
        .style.transform = `scale(${s})`;

      const openThreshold = this.TOMATO_TOTAL_FRAMES - 6;
      if (i >= openThreshold && this.isHover) {
        this.$refs.tomatoOverlay.classList.add("visible");
      } else {
        this.$refs.tomatoOverlay.classList.remove("visible");
      }
    },

    startAnim() {
      if (this.timer) return;
      this.timer = setInterval(() => {
        if (this.tomatoFrameIndex === this.targetFrame) {
          clearInterval(this.timer);
          this.timer = null;
          return;
        }
        this.tomatoFrameIndex +=
          this.tomatoFrameIndex < this.targetFrame ? 1 : -1;
        this.updateFrame(this.tomatoFrameIndex);
      }, 12);
    },

    bindTomatoEvents() {
      const w = this.$refs.tomatoWrapper;

      w.addEventListener("mouseenter", () => {
        this.isHover = true;
        this.targetFrame = this.TOMATO_TOTAL_FRAMES;
        this.startAnim();
      });

      w.addEventListener("mouseleave", () => {
        this.isHover = false;
        this.$refs.tomatoOverlay.classList.remove("visible");
        this.targetFrame = 1;
        this.startAnim();
      });

      w.addEventListener("click", () => {
        if (this.$refs.tomatoOverlay.classList.contains("visible")) {
          this.$refs.fileInput.click();
        }
      });
    },

    triggerUpload() {
      this.$refs.fileInput.click();
    },

    onFileChange(e) {
      const file = e.target.files?.[0];
      if (file) console.log(file.name);
    },
  },
};
</script>

<style scoped>
@import "./home.css";
</style>