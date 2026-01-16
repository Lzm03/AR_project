<template>
  <div class="library-shell">
    <!-- ===== Top Bar（全站统一） ===== -->
    <header class="top-bar">
      <div class="top-left">
        <div class="logo-dot"></div>
        <div>
          <div class="top-title">CHOP REALITY</div>
          <div class="top-sub">Personal AR Library</div>
        </div>
      </div>

      <div class="top-right">
        <button class="link-btn" @click="$router.back()">← 返回</button>
        <button class="link-btn accent" @click="logout">登出</button>
      </div>
    </header>

    <!-- ⭐ 页面内容插槽 -->
    <router-view />
  </div>
</template>

<script setup>
const API_BASE = "http://localhost:3001";

function logout() {
  fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).finally(() => {
    location.href = "/login";
  });
}
</script>

<style>
/* Library Shell 负责全页面滚动 */
.library-shell {
  min-height: 100vh;
  overflow-y: auto;
}
</style>
