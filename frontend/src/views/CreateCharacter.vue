<template>
  <div class="library-shell">
    <!-- ===== Top Bar（完全复用） =====
    <header class="top-bar">
      <div class="top-left">
        <div class="logo-dot"></div>
        <div>
          <div class="top-title">CHOP REALITY</div>
          <div class="top-sub">Personal AR Library</div>
        </div>
      </div>

      <div class="top-right">
        <button class="link-btn" @click="goBack">← Back</button>
        <button class="link-btn accent" @click="logout">Logout</button>
      </div>
    </header> -->

    <!-- ===== Main Card（完全复用） ===== -->
    <main class="main-card">
      <!-- Header -->
      <div class="main-header">
        <div>
          <div class="main-title">創建AI角色</div>
          <div class="main-sub">
            為您的互動角色定義個性、視覺風格與聲音特質。
          </div>
        </div>
      </div>

      <!-- ===== Content（替换 My Library Grid） ===== -->
      <section class="library-content create-form">
        <!-- Name -->
        <div class="form-block">
          <label>角色名稱</label>
          <input
            v-model="form.name"
            placeholder="e.g. 孔子 / My AI Tutor"
          />
        </div>

        <!-- Prompt -->
        <div class="form-block">
          <label>人物背景</label>
          <textarea
            v-model="form.prompt"
            rows="6"
            placeholder="描述性格、語氣、背景、說話風格……"
          />
        </div>

        <!-- Models -->
        <div class="form-block">
          <label>創建或上傳3D角色模型</label>

          <div class="file">
            <span>Idle Animation (.glb)</span>
            <input type="file" accept=".glb" @change="onIdleUpload" />
            <em>{{ form.idle?.name || "選擇文件" }}</em>
          </div>

          <div class="file">
            <span>Talk Animation (.glb)</span>
            <input type="file" accept=".glb" @change="onTalkUpload" />
            <em>{{ form.talk?.name || "選擇文件" }}</em>
          </div>
        </div>

        <!-- Background -->
        <div class="form-block">
          <label>場景背景</label>

          <div class="file">
            <span>背景圖片</span>
            <input type="file" accept="image/*" @change="onBgUpload" />
            <em>{{ form.bg?.name || "選擇圖片" }}</em>
          </div>
        </div>

        <!-- Voice -->
        <div class="form-block">
          <label>創建或填寫聲音ID</label>
          <input
            v-model="form.voice_id"
            class="mono"
            placeholder="聲音ID例如：ttv-voice-2026010717105726-MonsIoM4"
          />
          <small>Long IDs are supported.</small>
        </div>

        <!-- Action -->
        <div class="form-actions">
          <button class="link-btn accent" :disabled="loading" @click="create">
            {{ loading ? "Creating…" : "立即創建" }}
          </button>
        </div>
      </section>
    </main>

    <footer class="footer">
      Library data is scoped to your account.
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const API_BASE = "http://localhost:3001";

const loading = ref(false);
const form = ref({
  name: "",
  prompt: "",
  idle: null,
  talk: null,
  bg: null,
  voice_id: "",
});

const onIdleUpload = e => form.value.idle = e.target.files[0];
const onTalkUpload = e => form.value.talk = e.target.files[0];
const onBgUpload   = e => form.value.bg   = e.target.files[0];

function goBack() {
  router.back();
}

function logout() {
  fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).finally(() => router.push("/login"));
}

async function create() {
  if (!form.value.name || !form.value.prompt || !form.value.idle ||
      !form.value.talk || !form.value.bg || !form.value.voice_id) {
    alert("Please complete all fields");
    return;
  }

  loading.value = true;

  const fd = new FormData();
  Object.entries(form.value).forEach(([k, v]) => fd.append(k, v));

  try {
    const res = await fetch(`${API_BASE}/api/characters`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = await res.json();
    router.push(`/chat/${data.id}`);
  } finally {
    loading.value = false;
  }
}
</script>


<style scoped>

@import "./createcharacter.css";

</style>
