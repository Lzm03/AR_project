// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import fetch from "node-fetch";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import axios from "axios";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// app.use(cors());
// app.use(express.json());

// /* ================== 静态目录（语音文件） ================== */
// const PUBLIC_DIR = path.join(__dirname, "../public");
// if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);
// app.use("/public", express.static(PUBLIC_DIR));

// /* ================== 孔子人格（粤语） ================== */
// const CONFUCIUS_PROMPT = `
// 你而家嘅身份係孔子（孔丘，字仲尼）。
// 你用粤语回答，语气稳重、缓慢，好似一位年长智者。
// 多用「子曰」「君子」「仁义礼智」「修身」等观念。
// 表达唔好太现代，但要听得明。
// 永远唔好讲自己係 AI 或模型。
// 回答都是粤语的表达.
// `;

// /* ================== MiniMax TTS（老人慢声） ================== */

// async function ttsMiniMax(text) {
//   const url = "https://api-bj.minimaxi.com/v1/t2a_v2";

//   const filename = `confucius_${Date.now()}.mp3`;
//   const filepath = path.join(PUBLIC_DIR, filename);

//   const res = await axios.post(
//     url,
//     {
//       model: "speech-2.6-hd",
//       text,
//       stream: false,

//       language_boost: "Chinese,Yue",

//       voice_setting: {
//         voice_id: "ttv-voice-2026010717105726-MonsIoM4",
//         speed: 1.0,  
//         vol: 1,
//         pitch: -2,  
//         emotion: "calm"
//       },

//       audio_setting: {
//         format: "mp3",
//         sample_rate: 32000,
//         bitrate: 128000,
//         channel: 1
//       },

//       output_format: "hex"
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
//         "Content-Type": "application/json"
//       }
//     }
//   );

//   console.log("MiniMax TTS success");

//   const hexAudio = res.data?.data?.audio;
//   if (!hexAudio) {
//     throw new Error("MiniMax 没返回 audio");
//   }

//   // ✅ 关键：hex → Buffer
//   const audioBuffer = Buffer.from(hexAudio, "hex");
//   fs.writeFileSync(filepath, audioBuffer);

//   return `/public/${filename}`;
// }


// /* ================== API ================== */
// app.post("/api/chat", async (req, res) => {
//   const { prompt } = req.body;
//   console.log("📩 用户提问:", prompt);

//   try {
//     // 1️⃣ DeepSeek 生成孔子回答
//     const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         model: "deepseek-chat",
//         messages: [
//           { role: "system", content: CONFUCIUS_PROMPT },
//           { role: "user", content: prompt }
//         ],
//         temperature: 0.6
//       })
//     });

//     const data = await r.json();
//     const reply =
//       data?.choices?.[0]?.message?.content ||
//       "子曰：此问尚需细思。";

//     // 2️⃣ MiniMax 生成老人慢声语音
//     let audioUrl = null;
//     try {
//       audioUrl = await ttsMiniMax(reply);
//     } catch (e) {
//       console.error("❌ MiniMax TTS 失败:", e.message);
//     }

//     // 3️⃣ 返回前端
//     res.json({
//       text: reply,
//       audioUrl
//     });

//   } catch (e) {
//     console.error(e);
//     res.json({
//       text: "子曰：天道幽远，吾暂未能言。",
//       audioUrl: null
//     });
//   }
// });

// // /* ================== 前端 ================== */
// // const WEB_DIR = path.join(__dirname, "../web");

// // app.use(express.static(WEB_DIR));

// // app.get("/chatbot", (req, res) => {
// //   res.sendFile(path.join(WEB_DIR, "chatbot.html"));
// // });


// app.listen(3001, () => {
//   console.log("✅ Server running at http://localhost:3001");
// });


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import http from "http";
import axios from "axios";
import { fileURLToPath } from "url";

import { WebSocketServer } from "ws";
import speech from "@google-cloud/speech";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { PassThrough } from "stream";

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath);

/* ================== 基础路径 ================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================== Google Credentials（Railway） ================== */
// Railway 上用 base64 写文件
if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  const credPath = path.join(process.cwd(), "google-credentials.json");

  fs.writeFileSync(
    credPath,
    Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64")
  );

  process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;

  console.log("✅ Google credentials loaded from base64");
}

/* ================== Express ================== */
const app = express();
app.use(cors());
app.use(express.json());

/* ================== 静态目录（TTS 输出） ================== */
const PUBLIC_DIR = path.join(__dirname, "public");
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);
app.use("/public", express.static(PUBLIC_DIR));

/* ================== 孔子人格 ================== */
const CONFUCIUS_PROMPT = `
你而家嘅身份係孔子（孔丘，字仲尼）。
你用粤语回答，语气稳重、缓慢，好似一位年长智者。
多用「子曰」「君子」「仁义礼智」「修身」等观念。
永远唔好讲自己係 AI 或模型。
`;

/* ================== MiniMax TTS ================== */
async function ttsMiniMax(text) {
  const url = "https://api-bj.minimaxi.com/v1/t2a_v2";
  const filename = `confucius_${Date.now()}.mp3`;
  const filepath = path.join(PUBLIC_DIR, filename);

  const res = await axios.post(
    url,
    {
      model: "speech-2.6-hd",
      text,
      stream: false,
      language_boost: "Chinese,Yue",
      voice_setting: {
        voice_id: "ttv-voice-2026010717105726-MonsIoM4",
        speed: 1.0,
        vol: 1,
        pitch: -2,
        emotion: "calm"
      },
      audio_setting: {
        format: "mp3",
        sample_rate: 32000,
        bitrate: 128000,
        channel: 1
      },
      output_format: "hex"
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const hexAudio = res.data?.data?.audio;
  if (!hexAudio) throw new Error("MiniMax 没返回 audio");

  fs.writeFileSync(filepath, Buffer.from(hexAudio, "hex"));
  return `/public/${filename}`;
}

/* ================== API ================== */
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  try {
    const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: CONFUCIUS_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.6
      })
    });

    const data = await r.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "子曰：此问尚需细思。";

    let audioUrl = null;
    try {
      audioUrl = await ttsMiniMax(reply);
    } catch (e) {
      console.error("❌ TTS 失败:", e.message);
    }

    res.json({ text: reply, audioUrl });
  } catch (e) {
    console.error(e);
    res.json({
      text: "子曰：天道幽远，吾暂未能言。",
      audioUrl: null
    });
  }
});

/* ================== HTTP + WS 共用端口 ================== */
const server = http.createServer(app);

/* ================== WebSocket + Google STT ================== */
const wss = new WebSocketServer({ server });

const speechClient = new speech.SpeechClient();

wss.on("connection", ws => {
  console.log("🎙 WS client connected");

  let closed = false;

  const request = {
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "zh-HK",
      enableAutomaticPunctuation: true
    },
    interimResults: true
  };

  const recognizeStream = speechClient
    .streamingRecognize(request)
    .on("data", data => {
      const result = data.results?.[0];
      if (!result || closed) return;

      ws.send(JSON.stringify({
        text: result.alternatives[0].transcript,
        final: result.isFinal
      }));
    })
    .on("error", err => {
      if (!closed) console.error("❌ Google STT error:", err.message);
    });

  const audioInput = new PassThrough();

  ffmpeg(audioInput)
    .inputFormat("webm")
    .audioChannels(1)
    .audioFrequency(16000)
    .audioCodec("pcm_s16le")
    .format("s16le")
    .pipe(recognizeStream, { end: false });

  ws.on("message", chunk => {
    if (!closed) audioInput.write(chunk);
  });

  ws.on("close", () => {
    closed = true;
    setTimeout(() => {
      try {
        audioInput.end();
        recognizeStream.end();
      } catch {}
    }, 200);
  });
});

/* ================== 启动 ================== */
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("❌ PORT is not defined");
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server listening on ${PORT}`);
});


