<template>
  <div id="app">
    <!-- 左侧 3D + 背景 -->
    <div id="vr" :style="bgStyle">
      <model-viewer
        v-if="modelSrc"
        :src="modelSrc"
        autoplay
        interaction-prompt="none"
        environment-image="neutral"
        exposure="1.0"
        style="background: transparent"
      />
    </div>

    <!-- 右侧聊天 -->
    <div id="panel">
      <div id="header">
        <b>{{ character?.name || "AI Character" }}</b><br />
      </div>

      <div id="chat" ref="chatEl"></div>

      <div id="input">
        <input
          id="prompt"
          v-model="prompt"
          :placeholder="character ? `向 ${character.name || '角色'} 發問⋯` : 'Loading…'"
          :disabled="isLocked || !character"
          @keydown.enter.prevent="onEnter"
        />

        <div
          id="micWrapper"
          :class="{ recording: isRecording }"
          @click="toggleMic"
        >
          <div class="ring ring-outer"></div>
          <div class="ring ring-inner"></div>

          <div id="micCore">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M19 11a7 7 0 01-14 0"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="12"
                y1="19"
                x2="12"
                y2="22"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>

        <button
          id="sendBtn"
          :class="{ stop: isLocked }"
          @click="onSendClick"
        >
          {{ isLocked ? "▪️" : "發送" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

/* ================= 配置 ================= */
const API_BASE = import.meta.env.DEV
  ? "http://localhost:3001"
  : import.meta.env.VITE_API_BASE;

const WS_BASE = import.meta.env.DEV
  ? "ws://localhost:3001"
  : import.meta.env.VITE_WS_BASE;


/* ================= 路由 / 角色 ================= */
const route = useRoute();
const characterId = route.params.id;


const character = ref(null);
const modelSrc = ref("");
const bgStyle = ref({});

/* ================= refs / state ================= */
const chatEl = ref(null);
const prompt = ref("");

const isLocked = ref(false);
const isRecording = ref(false);

/* ================= 全局变量 ================= */
let currentAudio = null;
let socket = null;
let recorder = null;
let pendingChunks = [];

let requestId = 0;
let blockSendOnce = false;

/* ===== 麦克风动画 ===== */
let audioContext = null;
let analyser = null;
let micSource = null;
let animationId = null;
let pulsePhase = 0;

/* ================= 加载角色 ================= */
onMounted(async () => {
  if (!characterId) {
    alert("No character id");
    return;
  }

  const res = await fetch(`${API_BASE}/api/characters/${characterId}`);
  if (!res.ok) {
    alert("Character not found");
    return;
  }

  character.value = await res.json();

  modelSrc.value = character.value.model.idle;
  console.log("MODEL SRC = ", modelSrc.value);
  bgStyle.value = {
    background: `url(${character.value.scene.bg}) center / cover no-repeat`
  };
  const q = route.query.q;
  if (q) {
    prompt.value = q;
    await send();      
  }
});

/* ================= 3D 动画 ================= */
function playIdle() {
  if (!character.value) return;
  modelSrc.value = character.value.model.idle;
}

function playTalk() {
  if (!character.value) return;
  modelSrc.value = character.value.model.talk;
}

/* ================= UI ================= */
function addMsg(role, text, ai = false) {
  chatEl.value.innerHTML +=
    `<div class="msg ${ai ? "ai" : ""}">${role}：${text}</div>`;
  chatEl.value.scrollTop = chatEl.value.scrollHeight;
}

/* ================= 打断系统 ================= */
function interrupt() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  playIdle();
}

function unlock() {
  interrupt();
  isLocked.value = false;
  blockSendOnce = false;
}

function forceInterrupt() {
  if (isLocked.value) {
    requestId++;
    unlock();
  } else {
    interrupt();
  }
}

/* ================= 聊天 ================= */
async function send() {
  if (!character.value) return;

  const myId = ++requestId;
  if (blockSendOnce || isLocked.value) return;

  isLocked.value = true;
  interrupt();


  const text = prompt.value.trim();
  if (!text) {
    unlock();
    return;
  }

  prompt.value = "";
  addMsg("你", text);

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: text,
      characterId
    })
  });

  const data = await res.json();
  if (myId !== requestId) return;

  addMsg(character.value.name || "AI", data.text, true);

  if (data.audioBase64) {
    const src = "data:audio/mp3;base64," + data.audioBase64;

    currentAudio = new Audio(src);
    playTalk();
    currentAudio.play();
    currentAudio.onended = unlock;
  } else {
    unlock();
  }
}

function unlockAudio() {
  const silent = new Audio(
    "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAA"
  );
  silent.play().catch(() => {});
}

function onSendClick() {
  unlockAudio(); 
  isLocked.value ? forceInterrupt() : send();
}

function onEnter() {
  isLocked.value ? unlock() : send();
}

/* ================= 麦克风 + WS ================= */
async function toggleMic() {
  unlockAudio();
  blockSendOnce = isLocked.value;
  if (isLocked.value) requestId++;

  forceInterrupt();

  if (isRecording.value) {
    stopMic();
    return;
  }

  isRecording.value = true;
  pendingChunks = [];

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
  const mime = MediaRecorder.isTypeSupported("audio/webm")
  ? "audio/webm"
  : "audio/mp4";
  
recorder = new MediaRecorder(stream, { mimeType: mime });

  recorder.ondataavailable = e => {
    if (!e.data || e.data.size === 0) return;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(e.data);
    } else {
      pendingChunks.push(e.data);
    }
  };
  recorder.start(10);

  socket = new WebSocket(WS_BASE);
  socket.onopen = () => {
    pendingChunks.forEach(c => socket.send(c));
    pendingChunks = [];
  };
  socket.onmessage = e => {
    const d = JSON.parse(e.data);
    if (!d.text) return;

    prompt.value = d.text;
    if (d.final) {
      send();
      stopMic();
    }
  };

  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  micSource = audioContext.createMediaStreamSource(stream);
  micSource.connect(analyser);

  startMicAnimation();
}

function stopMic() {
  recorder?.state !== "inactive" && recorder.stop();
  socket?.readyState === 1 && socket.close();
  stopMicAnimation();
  audioContext?.close();
  isRecording.value = false;
}

/* ================= 🎙 动画 ================= */
function startMicAnimation() {
  const outer = document.querySelector(".ring-outer");
  if (!outer || !analyser) return;

  const data = new Uint8Array(analyser.frequencyBinCount);

  function animate() {
    analyser.getByteFrequencyData(data);
    const vol = data.reduce((s, v) => s + v, 0) / data.length;

    pulsePhase += 0.05;
    const pulse = Math.sin(pulsePhase) * 0.15 + 1;
    const scale = pulse + Math.min(vol / 120, 0.6);

    outer.style.transform = `scale(${scale})`;
    outer.style.opacity = Math.min(0.3 + vol / 100, 1);

    animationId = requestAnimationFrame(animate);
  }
  animate();
}

function stopMicAnimation() {
  cancelAnimationFrame(animationId);
  const outer = document.querySelector(".ring-outer");
  if (outer) {
    outer.style.transform = "scale(0.9)";
    outer.style.opacity = 0;
  }
}
</script>

<style>
@import "./chatbot.css";
</style>
