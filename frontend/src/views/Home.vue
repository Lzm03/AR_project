<template>
  <!-- ===== 右上角登录状态（原样保留） ===== -->
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

      <!-- ================================================= -->
      <!-- ===== GRID 1：Hero（原样保留，不允许修改）===== -->
      <!-- ================================================= -->
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

      <!-- ================================================= -->
      <!-- ===== GRID 2：Intro（原样保留，不允许修改）===== -->
      <!-- ================================================= -->
      
      <section class="hero-info-section">
        <div class="hero-info-title">專為教育而設</div>

        <p class="hero-info-text">
          Chopreality 是一個無需編程的AI 藝術創作平台，讓師生在零基礎下也能輕鬆一站式創作不同AI作品，製作出用於教學或展示的互動作品。<br />
        </p>
      </section>

      <!-- ================================================= -->
      <!-- ===== GRID 3：Characters（原样保留，不允许修改）===== -->
      <!-- ================================================= -->
      <section class="section section-characters">
        <h2 class="section-title">立刻和世界上的名人聊天</h2>

        <div class="character-grid">
          <!-- 孔子 -->
          <div
            class="character-card character-confucius clickable-card"
            @click="goCharacter('confucius')"
          >
            <div class="character-avatar">孔子</div>
            <div class="character-quotes">
            <div
              class="character-quote clickable-quote"
              @click.stop="goQuote('confucius', '如果同學欺負我，我該「以德報怨」嗎？')"
            >
              如果同學欺負我，我該「以德報怨」嗎？
            </div>
            <div
              class="character-quote clickable-quote"
              @click.stop="goQuote('confucius', '你覺得現在的學生和古代的學生，誰...')"
            >
              你覺得現在的學生和古代的學生，誰...
            </div>
            <div
              class="character-quote clickable-quote"
              @click.stop="goQuote('confucius', '「學而時習之」為什麼會快樂？')"
            >
              「學而時習之」為什麼會快樂？
            </div>
            </div>
          </div>

          <!-- 牛顿 -->
          <div
            class="character-card character-newton clickable-card"
            @click="goCharacter('newton')"
          >
            <div class="character-avatar">牛頓</div>
            <div class="character-quotes">
            <div
              class="character-quote clickable-quote"
              @click.stop="goQuote('newton', '如果穿越回現代，你會先學物理,化學...')"
            >
              如果穿越回現代，你會先學物理,化學...
            </div>
            <div
              class="character-quote clickable-quote"
              @click.stop="goQuote('newton', '你發明了那麼多東西，有沒有哪個是...')"
            >
              你發明了那麼多東西，有沒有哪個是...
            </div>
            <div
              class="character-quote clickable-quote"
              @click.stop="goQuote('newton', '網絡上有很多‘知識分享者’，你會想當...')"
            >
              網絡上有很多‘知識分享者’，你會想當...
            </div>
            </div>
          </div>

          <!-- 愛因斯坦 -->
          <div
            class="character-card character-einstein clickable-card"
            @click="goCharacter('einstein')"
          >
            <div class="character-avatar">愛因斯坦</div>
            <div class="character-quotes">
            <div
              class="character-quote clickable-quote"
              @click.stop="goQuote('einstein', '你覺得AI聰明，還是人腦聰明？')"
            >
              你覺得AI聰明，還是人腦聰明？
            </div>
            <div
              class="character-quote clickable-quote"
              @click.stop="goQuote('einstein', '你的相對論是怎麼想出來的？是做了...')"
            >
              你的相對論是怎麼想出來的？是做了...
            </div>
            <div
              class="character-quote clickable-quote"
              @click.stop="goQuote('einstein', '你考試也不及格過嗎？你怎麼面對失敗？')"
            >
              你考試也不及格過嗎？你怎麼面對失敗？
            </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== 第 4 格：AI 設計工具 ===== -->
      <section class="section section-tools">
        <div class="tools-container">

          <!-- 顶部标题行 -->
          <div class="tools-header">
            <h2 class="tools-title">
              使用豐富的<br />
              AI設計工具
            </h2>

            <button class="tools-more">
              查看更多
            </button>
          </div>

          <!-- 工具卡片区 -->
          <div class="tools-grid">

            <!-- 工具 1 -->
            <div class="tool-card">
              <div class="tool-icon gradient-a"></div>
              <div class="tool-text">
                <div class="tool-name">數字人生成工具</div>
                <div class="tool-desc">能與你互動的虛擬角色</div>
              </div>
            </div>

            <!-- 工具 2 -->
            <div class="tool-card">
              <div class="tool-icon gradient-b"></div>
              <div class="tool-text">
                <div class="tool-name">圖像生成工具</div>
                <div class="tool-desc">用 AI 生成你想像的圖片</div>
              </div>
            </div>

            <!-- 工具 3 -->
            <div class="tool-card">
              <div class="tool-icon gradient-c"></div>
              <div class="tool-text">
                <div class="tool-name">視頻生成工具</div>
                <div class="tool-desc">用 AI 製作短片及動畫</div>
              </div>
            </div>

            <!-- 工具 4 -->
            <div class="tool-card">
              <div class="tool-icon gradient-d"></div>
              <div class="tool-text">
                <div class="tool-name">音頻生成工具</div>
                <div class="tool-desc">用 AI 生成角色的聲音</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ================================================= -->
      <!-- ===== GRID 5：视频 整块区域（按 screenshot）===== -->
      <!-- ================================================= -->
      <section class="section section-video">
        <div class="video-container">
          <div class="video-sidebar placeholder-dark"></div>
          <div class="video-chat placeholder-light"></div>
          <div class="video-input placeholder-light"></div>
        </div>
      </section>


      <!-- ===== 第 6 格：教育政策整合（像素级复刻） ===== -->
      <section class="edu-section">

        <!-- 上半区：口号 -->
        <div class="edu-hero">
          <div class="edu-sub">創建各科的校本專屬助手</div>

          <h2 class="edu-title">
            教師輕鬆管理，學生隨時使用<br />
          </h2>

          <div class="edu-tags">
            <span class="edu-tag">▶ 一站式</span>
            <span class="edu-tag">▶ 本地化</span>
            <span class="edu-tag">▶ 可持續</span>
          </div>
        </div>

        <!-- 下半区：政策 + 图 -->
        <div class="edu-policy">
          <!-- 左 -->
          <div class="policy-left">
            <div class="policy-label">完美融入相應政府策略</div>
            <div class="policy-line"></div>

            <div class="policy-logo"></div>

            <p class="policy-text">
              ChopReality 為香港學校帶來一站式解決方案。師生無需編程背景，
              即可輕鬆創作「會說話、能互動」的 AI 角色與 AR 作品，
              完美融入 STEAM、歷史、語文及資訊科技課程，
              並直接對接教育局撥款資源。
            </p>
          </div>

          <!-- 右 -->
          <div class="policy-image"></div>
        </div>

      </section>

<!-- ================================================= -->
<!-- ============== GRID 7：三大優勢（像素级）=========== -->
<!-- ================================================= -->
<section class="advantages-section">

  <!-- 背景淡字 -->
  <div class="adv-bg-title">特色功能介紹</div>

  <!-- 主标题 -->
  <h2 class="adv-main-title">三大優勢</h2>

  <!-- 大白卡片容器 -->
  <div class="advantages-wrapper">

    <div class="adv-item">
      <div class="adv-icon"></div>
      <h3 class="adv-item-title">零代碼，極易上手</h3>
      <p class="adv-item-desc">直觀拖拉介面，3 小時內即可完成作品。</p>
    </div>

    <div class="adv-item">
      <div class="adv-icon"></div>
      <h3 class="adv-item-title">跨學科，深度融合</h3>
      <p class="adv-item-desc">支援歷史、文學、IT、視藝等多學科。</p>
    </div>

    <div class="adv-item">
      <div class="adv-icon"></div>
      <h3 class="adv-item-title">對政策，善用撥款</h3>
      <p class="adv-item-desc">直接對應 AI 賦能學與教策略。</p>
    </div>

  </div>
</section>


      <!-- ================================================= -->
      <!-- ===== GRID 8：CTA（按 screenshot）===== -->
      <!-- ================================================= -->
      <section class="cta-bar">
        由香港理工大學碩士團隊開發｜香港科技園孵化夥伴
      </section>

<section class="section-cta">
  <div class="cta-inner">
    <div class="cta-sub">創造專屬的學科機器人</div>

    <h2 class="cta-title">
      試試 ChopReality，<br />
      使用 AI 創造無限的可能性。
    </h2>

    <button class="cta-btn">立即使用</button>
  </div>
</section>

    </div>
  </div>

  <!-- ===== 隐藏的文件上传 ===== -->
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
    goLogin() { location.href = "/login"; },

    go(path) { location.href = path; },

    goCharacter(id) {
      location.href = `/chat/${id}`;
    },
    goQuote(id, text) {
      const encoded = encodeURIComponent(text);
      location.href = `/chat/${id}?q=${encoded}`;
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
